package expo.modules.appblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Process
import android.provider.Settings
import android.util.Base64
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

private const val TAG = "ExpoAppBlocker"

class ExpoAppBlockerModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ExpoAppBlocker")

    OnCreate {
      AppBlockerService.start(context)
      Log.d(TAG, "Module OnCreate: started AppBlockerService")
    }

    AsyncFunction("checkOverlayPermission") {
      Settings.canDrawOverlays(context)
    }

    AsyncFunction("checkUsageStatsPermission") {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName
      )
      mode == AppOpsManager.MODE_ALLOWED
    }

    AsyncFunction("checkNotificationPermission") {
      NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    Function("openOverlaySettings") {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("openUsageStatsSettings") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("setAndroidConfig") { config: Map<String, Any?> ->
      // JS sends numbers as Double over the bridge — coerce to Float so prefs
      // keep a consistent type. Booleans are forwarded as-is.
      fun numberOrNull(key: String): Float? = (config[key] as? Number)?.toFloat()

      AppBlockerPrefs.setAndroidConfig(
        context,
        overlayTitle = config["overlayTitle"] as? String,
        overlayText = config["overlayText"] as? String,
        overlayBackgroundColor = config["overlayBackgroundColor"] as? String,
        overlayTitleColor = config["overlayTitleColor"] as? String,
        overlayTextColor = config["overlayTextColor"] as? String,
        overlayTitleFontSize = numberOrNull("overlayTitleFontSize"),
        overlayTextFontSize = numberOrNull("overlayTextFontSize"),
        overlayTitleBold = config["overlayTitleBold"] as? Boolean,
        overlayPadding = numberOrNull("overlayPadding"),
        overlayIconSize = numberOrNull("overlayIconSize"),
        overlayIconBottomMargin = numberOrNull("overlayIconBottomMargin"),
        overlayTitleBottomMargin = numberOrNull("overlayTitleBottomMargin"),
        overlayShowSpinner = config["overlayShowSpinner"] as? Boolean,
        overlaySpinnerSize = numberOrNull("overlaySpinnerSize"),
        overlaySpinnerTopMargin = numberOrNull("overlaySpinnerTopMargin"),
        overlaySpinnerColor = config["overlaySpinnerColor"] as? String,
        notificationTitle = config["notificationTitle"] as? String,
        notificationText = config["notificationText"] as? String,
      )
      Log.d(TAG, "setAndroidConfig: $config")
    }

    Function("setBlockedApps") { packageNames: List<String> ->
      AppBlockerPrefs.setBlockedPackages(context, packageNames)
      Log.d(TAG, "setBlockedApps: $packageNames")
    }

    Function("getBlockedApps") {
      AppBlockerPrefs.getBlockedPackages(context).toList()
    }

    Function("setRewardBlockerConfig") { rawConfig: Map<String, Any?> ->
      fun requiredPackages(key: String): Set<String> =
        (rawConfig[key] as? List<*>)
          ?.mapNotNull { it as? String }
          ?.filter { it.isNotBlank() }
          ?.toSet()
          ?: emptySet()
      fun requiredMinute(key: String): Int =
        (rawConfig[key] as? Number)?.toInt()
          ?: throw IllegalArgumentException("$key is required.")

      val schedule = rawConfig["schedule"] as? Map<*, *>
        ?: throw IllegalArgumentException("schedule is required.")
      val enabled = rawConfig["enabled"] as? Boolean ?: false
      val blockedPackages = requiredPackages("blockedPackages")
      val productivePackages = requiredPackages("productivePackages")
      val startMinute = (schedule["startMinute"] as? Number)?.toInt()
        ?: throw IllegalArgumentException("schedule.startMinute is required.")
      val endMinute = (schedule["endMinute"] as? Number)?.toInt()
        ?: throw IllegalArgumentException("schedule.endMinute is required.")
      val productiveMinutes = requiredMinute("productiveMinutes")
      val unlockMinutes = requiredMinute("unlockMinutes")

      RewardBlockerController.validate(
        enabled,
        blockedPackages,
        productivePackages,
        startMinute,
        endMinute,
        productiveMinutes,
        unlockMinutes,
      )
      RewardBlockerController(context).configure(
        RewardBlockerController.Config(listOf(RewardBlockerController.Plan(
          "default",
          "focus",
          enabled,
          blockedPackages,
          productivePackages,
          (1..7).toSet(),
          startMinute,
          endMinute,
          productiveMinutes,
          unlockMinutes,
        )))
      )
      // Keep the public legacy getter in sync for host apps that display it.
      AppBlockerPrefs.setBlockedPackages(context, blockedPackages)
      AppBlockerService.start(context)
      Log.d(TAG, "setRewardBlockerConfig: enabled=$enabled blocked=${blockedPackages.size} productive=${productivePackages.size}")
    }

    Function("setRewardBlockerPlansConfig") { rawConfig: Map<String, Any?> ->
      val rawPlans = rawConfig["plans"] as? List<*>
        ?: throw IllegalArgumentException("plans is required.")
      val plans = rawPlans.mapIndexed { index, rawPlan ->
        val plan = rawPlan as? Map<*, *> ?: throw IllegalArgumentException("plans[$index] is invalid.")
        fun packages(key: String): Set<String> = (plan[key] as? List<*>)
          ?.mapNotNull { it as? String }?.filter { it.isNotBlank() }?.toSet() ?: emptySet()
        fun minute(key: String): Int = (plan[key] as? Number)?.toInt()
          ?: throw IllegalArgumentException("plans[$index].$key is required.")
        val schedule = plan["schedule"] as? Map<*, *>
          ?: throw IllegalArgumentException("plans[$index].schedule is required.")
        val weekdays = (schedule["weekdays"] as? List<*>)
          ?.mapNotNull { (it as? Number)?.toInt() }
          ?.filter { it in 1..7 }
          ?.toSet()
          ?.ifEmpty { null }
          ?: (1..7).toSet()
        RewardBlockerController.Plan(
          id = plan["id"] as? String ?: throw IllegalArgumentException("plans[$index].id is required."),
          mode = plan["mode"] as? String ?: "focus",
          enabled = plan["enabled"] as? Boolean ?: false,
          blockedPackages = packages("blockedPackages"),
          productivePackages = packages("productivePackages"),
          weekdays = weekdays,
          startMinute = (schedule["startMinute"] as? Number)?.toInt() ?: throw IllegalArgumentException("plans[$index].schedule.startMinute is required."),
          endMinute = (schedule["endMinute"] as? Number)?.toInt() ?: throw IllegalArgumentException("plans[$index].schedule.endMinute is required."),
          productiveMinutes = minute("productiveMinutes"),
          unlockMinutes = minute("unlockMinutes"),
        )
      }
      RewardBlockerController.validatePlans(plans)
      val controller = RewardBlockerController(context)
      controller.configure(RewardBlockerController.Config(plans))
      AppBlockerPrefs.setBlockedPackages(context, controller.allBlockedPackages())
      AppBlockerService.start(context)
      Log.d(TAG, "setRewardBlockerPlansConfig: plans=${plans.size}")
    }

    Function("getRewardBlockerStatus") {
      RewardBlockerController(context).getStatus().asMap()
    }

    Function("clearRewardBlockerConfig") {
      RewardBlockerController(context).clear()
      AppBlockerPrefs.setBlockedPackages(context, emptySet())
      AppBlockerService.relock(context)
      Log.d(TAG, "clearRewardBlockerConfig")
    }

    Function("drainPendingIntercepts") {
      AppBlockerPrefs.drainIntercepts(context)
    }

    Function("startMonitoring") {
      AppBlockerService.start(context)
      Log.d(TAG, "startMonitoring called")
    }

    Function("stopMonitoring") {
      AppBlockerService.stop(context)
      Log.d(TAG, "stopMonitoring called")
    }

    Function("temporaryUnlockAndroid") { durationMinutes: Int ->
      AppBlockerService.temporaryUnlock(context, durationMinutes)
      Log.d(TAG, "temporaryUnlockAndroid: $durationMinutes minutes")
    }

    Function("relockAndroid") {
      AppBlockerService.relock(context)
      Log.d(TAG, "relockAndroid")
    }

    Function("getRemainingUnlockTimeAndroid") {
      TemporaryUnlockController.remainingSeconds(context)
    }

    // Last-resort recovery for an unrecoverable native state (observed:
    // expo-sqlite's Android connection degrading after enough reuse in a
    // long-lived process — a fresh `openDatabaseAsync` + first pragma NPEs
    // even after a full DB rebuild). Apps that keep this module's
    // AppBlockerService running as a foreground service can end up with an
    // unusually long-lived process (the OS won't kill it just because the
    // Activity was "closed"), which surfaces exactly this kind of
    // native-module degradation far more than a normal app would. Only a
    // genuine process kill clears it: queue the relaunch intent (optionally
    // straight back into `deepLink`, e.g. the blocker intercept URL the
    // caller was trying to reach) — `startActivity` only needs to queue the
    // intent with ActivityManagerService, which survives our process dying
    // right after — then kill this process outright. No AlarmManager/
    // PendingIntent needed (and SCHEDULE_EXACT_ALARM would require a
    // permission apps otherwise don't need just for this).
    Function("restartApp") { deepLink: String? ->
      val intent = if (!deepLink.isNullOrEmpty()) {
        Intent(Intent.ACTION_VIEW, Uri.parse(deepLink))
      } else {
        context.packageManager.getLaunchIntentForPackage(context.packageName)
      }
      if (intent == null) {
        Log.e(TAG, "restartApp: no launch intent resolvable, cannot self-heal")
        return@Function
      }
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)

      context.startActivity(intent)

      Log.w(
        TAG,
        "restartApp: relaunch queued, killing process ${Process.myPid()} to recover " +
          "from an unrecoverable native state"
      )
      Process.killProcess(Process.myPid())
    }

    AsyncFunction("getInstalledApps") {
      val pm = context.packageManager
      val intent = Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }
      val resolved = pm.queryIntentActivities(intent, 0)
      val seen = HashSet<String>()
      resolved.mapNotNull { resolveInfo ->
        val appInfo = resolveInfo.activityInfo.applicationInfo
        if (appInfo.packageName == context.packageName) return@mapNotNull null
        if (!seen.add(appInfo.packageName)) return@mapNotNull null

        val iconBase64 = try {
          val drawable = pm.getApplicationIcon(appInfo)
          drawableToBase64Png(drawable)
        } catch (e: Exception) {
          Log.w(TAG, "Failed to load icon for ${appInfo.packageName}: ${e.message}")
          null
        }

        mapOf(
          "packageName" to appInfo.packageName,
          "name" to (pm.getApplicationLabel(appInfo)?.toString() ?: appInfo.packageName),
          "iconBase64" to iconBase64
        )
      }.sortedBy { it["name"]?.toString()?.lowercase() }
    }
  }

  private fun drawableToBase64Png(drawable: Drawable): String {
    val size = 96
    val bitmap = if (drawable is BitmapDrawable && drawable.bitmap != null) {
      Bitmap.createScaledBitmap(drawable.bitmap, size, size, true)
    } else {
      val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bmp)
      drawable.setBounds(0, 0, canvas.width, canvas.height)
      drawable.draw(canvas)
      bmp
    }
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
  }
}
