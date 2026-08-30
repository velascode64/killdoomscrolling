package expo.modules.appblocker

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/** Persistent state machine for one or more non-overlapping reward plans. */
class RewardBlockerController(private val context: Context) {
  data class Plan(
    val id: String,
    val mode: String,
    val enabled: Boolean,
    val blockedPackages: Set<String>,
    val productivePackages: Set<String>,
    val weekdays: Set<Int>,
    val startMinute: Int,
    val endMinute: Int,
    val productiveMinutes: Int,
    val unlockMinutes: Int,
  )

  data class Config(val plans: List<Plan>)

  data class ProductiveApp(val packageName: String, val label: String)

  data class Status(
    val enabled: Boolean,
    val isScheduleActive: Boolean,
    val phase: String,
    val productiveElapsedSeconds: Int,
    val productiveRemainingSeconds: Int,
    val unlockRemainingSeconds: Int,
    val activePlanId: String? = null,
    val activePlanMode: String? = null,
  ) {
    fun asMap(): Map<String, Any> = mapOf<String, Any>(
      "enabled" to enabled,
      "isScheduleActive" to isScheduleActive,
      "phase" to phase,
      "productiveElapsedSeconds" to productiveElapsedSeconds,
      "productiveRemainingSeconds" to productiveRemainingSeconds,
      "unlockRemainingSeconds" to unlockRemainingSeconds,
      "activePlanId" to (activePlanId ?: ""),
      "activePlanMode" to (activePlanMode ?: ""),
    )
  }

  private var productiveSinceMs = 0L
  private var productivePlanId: String? = null

  fun isConfigured(): Boolean = config()?.plans?.any { it.enabled } == true

  fun isBlockedPackage(packageName: String, nowMs: Long = System.currentTimeMillis()): Boolean =
    activePlan(nowMs)?.blockedPackages?.contains(packageName) == true

  fun isProductivePackage(packageName: String, nowMs: Long = System.currentTimeMillis()): Boolean =
    activePlan(nowMs)?.productivePackages?.contains(packageName) == true

  fun activePlanMode(nowMs: Long = System.currentTimeMillis()): String =
    activePlan(nowMs)?.mode ?: "focus"

  fun productiveApps(nowMs: Long = System.currentTimeMillis()): List<ProductiveApp> =
    activePlan(nowMs)?.productivePackages
      ?.mapNotNull { packageName ->
        try {
          val packageManager = context.packageManager
          if (packageManager.getLaunchIntentForPackage(packageName) == null) return@mapNotNull null
          val label = packageManager.getApplicationLabel(packageManager.getApplicationInfo(packageName, 0)).toString()
          ProductiveApp(packageName, label)
        } catch (_: Exception) {
          null
        }
      }
      ?.sortedBy { it.label.lowercase() }
      ?: emptyList()

  fun tick(foregroundPackage: String?, nowMs: Long): Status {
    val config = config() ?: return inactiveStatus()
    val plan = activePlan(nowMs, config)
    if (plan == null) {
      resetAllProgress(config)
      clearAllUnlocks(config)
      productiveSinceMs = 0L
      productivePlanId = null
      return status(config, null, nowMs)
    }

    if (productivePlanId != plan.id) {
      productiveSinceMs = 0L
      productivePlanId = plan.id
    }

    if (unlockEndsAtMs(plan.id) > 0L) {
      productiveSinceMs = 0L
      if (unlockEndsAtMs(plan.id) <= nowMs) clearUnlock(plan.id)
      return status(config, plan, nowMs)
    }

    if (foregroundPackage != null && foregroundPackage in plan.productivePackages) {
      if (productiveSinceMs == 0L) productiveSinceMs = nowMs
      val elapsed = (nowMs - productiveSinceMs).coerceAtLeast(0L)
      if (elapsed > 0L) addProductiveElapsed(plan.id, elapsed)
      productiveSinceMs = nowMs
      if (productiveElapsedMs(plan.id) >= plan.productiveMinutes * MINUTE_MS) {
        resetProgress(plan.id)
        setUnlockEndsAtMs(plan.id, nowMs + plan.unlockMinutes * MINUTE_MS)
        productiveSinceMs = 0L
      }
    } else {
      productiveSinceMs = 0L
    }
    return status(config, plan, nowMs)
  }

  fun getStatus(nowMs: Long = System.currentTimeMillis()): Status {
    val config = config() ?: return inactiveStatus()
    val plan = activePlan(nowMs, config)
    if (plan != null && unlockEndsAtMs(plan.id) in 1..nowMs) clearUnlock(plan.id)
    return status(config, plan, nowMs)
  }

  fun configure(config: Config) {
    val json = JSONObject().apply {
      put("plans", JSONArray(config.plans.map { plan -> JSONObject().apply {
        put("id", plan.id)
        put("mode", plan.mode)
        put("enabled", plan.enabled)
        put("blockedPackages", JSONArray(plan.blockedPackages.toList()))
        put("productivePackages", JSONArray(plan.productivePackages.toList()))
        put("weekdays", JSONArray(plan.weekdays.sorted()))
        put("startMinute", plan.startMinute)
        put("endMinute", plan.endMinute)
        put("productiveMinutes", plan.productiveMinutes)
        put("unlockMinutes", plan.unlockMinutes)
      } }))
    }
    AppBlockerPrefs.get(context).edit()
      .putString(KEY_CONFIG, json.toString())
      .remove(KEY_PRODUCTIVE_ELAPSED_MS)
      .remove(KEY_UNLOCK_ENDS_AT_MS)
      .remove(KEY_PRODUCTIVE_ELAPSED_BY_PLAN)
      .remove(KEY_UNLOCK_ENDS_BY_PLAN)
      .apply()
    productiveSinceMs = 0L
    productivePlanId = null
  }

  fun clear() {
    AppBlockerPrefs.get(context).edit()
      .remove(KEY_CONFIG)
      .remove(KEY_PRODUCTIVE_ELAPSED_MS)
      .remove(KEY_UNLOCK_ENDS_AT_MS)
      .remove(KEY_PRODUCTIVE_ELAPSED_BY_PLAN)
      .remove(KEY_UNLOCK_ENDS_BY_PLAN)
      .apply()
    productiveSinceMs = 0L
    productivePlanId = null
  }

  fun allBlockedPackages(): Set<String> = config()?.plans
    ?.filter { it.enabled }
    ?.flatMap { it.blockedPackages }
    ?.toSet()
    ?: emptySet()

  private fun config(): Config? {
    val raw = AppBlockerPrefs.get(context).getString(KEY_CONFIG, null) ?: return null
    return try {
      val json = JSONObject(raw)
      val plans = json.optJSONArray("plans")?.let { values ->
        buildList {
          for (index in 0 until values.length()) {
            val plan = values.optJSONObject(index) ?: continue
            add(planFromJson(plan, "plan-$index"))
          }
        }
      } ?: listOf(planFromJson(json, "default"))
      Config(plans)
    } catch (_: Exception) {
      null
    }
  }

  private fun planFromJson(json: JSONObject, fallbackId: String) = Plan(
    id = json.optString("id", fallbackId).ifBlank { fallbackId },
    mode = json.optString("mode", "focus").ifBlank { "focus" },
    enabled = json.optBoolean("enabled", false),
    blockedPackages = json.optStringSet("blockedPackages"),
    productivePackages = json.optStringSet("productivePackages"),
    weekdays = json.optIntSet("weekdays", ALL_WEEKDAYS),
    startMinute = json.optInt("startMinute", 0),
    endMinute = json.optInt("endMinute", 0),
    productiveMinutes = json.optInt("productiveMinutes", 5),
    unlockMinutes = json.optInt("unlockMinutes", 5),
  )

  private fun JSONObject.optStringSet(key: String): Set<String> {
    val values = optJSONArray(key) ?: return emptySet()
    return buildSet {
      for (index in 0 until values.length()) {
        values.optString(index).takeIf { it.isNotBlank() }?.let(::add)
      }
    }
  }

  private fun JSONObject.optIntSet(key: String, fallback: Set<Int>): Set<Int> {
    val values = optJSONArray(key) ?: return fallback
    return buildSet {
      for (index in 0 until values.length()) values.optInt(index).takeIf { it in 1..7 }?.let(::add)
    }.ifEmpty { fallback }
  }

  private fun activePlan(nowMs: Long, currentConfig: Config? = null): Plan? {
    val config = currentConfig ?: config() ?: return null
    val calendar = Calendar.getInstance().apply { timeInMillis = nowMs }
    val minute = calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE)
    val weekday = ((calendar.get(Calendar.DAY_OF_WEEK) + 5) % 7) + 1
    return config.plans.firstOrNull { isScheduleActive(it, weekday, minute) }
  }

  private fun isScheduleActive(plan: Plan, weekday: Int, minute: Int): Boolean {
    if (!plan.enabled || plan.startMinute == plan.endMinute) return false
    if (plan.startMinute < plan.endMinute) {
      return weekday in plan.weekdays && minute >= plan.startMinute && minute < plan.endMinute
    }
    val scheduleWeekday = if (minute >= plan.startMinute) weekday else if (weekday == 1) 7 else weekday - 1
    return scheduleWeekday in plan.weekdays && (minute >= plan.startMinute || minute < plan.endMinute)
  }

  private fun status(config: Config, plan: Plan?, nowMs: Long): Status {
    if (plan == null) return Status(config.plans.any { it.enabled }, false, "inactive", 0, 0, 0)
    val elapsedMs = productiveElapsedMs(plan.id)
    val unlockRemainingMs = (unlockEndsAtMs(plan.id) - nowMs).coerceAtLeast(0L)
    return Status(
      enabled = config.plans.any { it.enabled },
      isScheduleActive = true,
      phase = if (unlockRemainingMs > 0L) "unlocked" else "earning",
      productiveElapsedSeconds = (elapsedMs / 1000L).toInt(),
      productiveRemainingSeconds = ((plan.productiveMinutes * MINUTE_MS - elapsedMs).coerceAtLeast(0L) / 1000L).toInt(),
      unlockRemainingSeconds = (unlockRemainingMs / 1000L).toInt(),
      activePlanId = plan.id,
      activePlanMode = plan.mode,
    )
  }

  private fun inactiveStatus() = Status(false, false, "inactive", 0, 0, 0)

  private fun planValue(key: String, planId: String): Long = try {
    val raw = AppBlockerPrefs.get(context).getString(key, "{}") ?: "{}"
    JSONObject(raw).optLong(planId, 0L).coerceAtLeast(0L)
  } catch (_: Exception) { 0L }

  private fun setPlanValue(key: String, planId: String, value: Long) {
    val json = try {
      JSONObject(AppBlockerPrefs.get(context).getString(key, "{}") ?: "{}")
    } catch (_: Exception) { JSONObject() }
    json.put(planId, value.coerceAtLeast(0L))
    AppBlockerPrefs.get(context).edit().putString(key, json.toString()).apply()
  }

  private fun productiveElapsedMs(planId: String) = planValue(KEY_PRODUCTIVE_ELAPSED_BY_PLAN, planId)
  private fun addProductiveElapsed(planId: String, elapsedMs: Long) =
    setPlanValue(KEY_PRODUCTIVE_ELAPSED_BY_PLAN, planId, productiveElapsedMs(planId) + elapsedMs)
  private fun resetProgress(planId: String) = setPlanValue(KEY_PRODUCTIVE_ELAPSED_BY_PLAN, planId, 0L)
  private fun unlockEndsAtMs(planId: String) = planValue(KEY_UNLOCK_ENDS_BY_PLAN, planId)
  private fun setUnlockEndsAtMs(planId: String, value: Long) = setPlanValue(KEY_UNLOCK_ENDS_BY_PLAN, planId, value)
  private fun clearUnlock(planId: String) = setUnlockEndsAtMs(planId, 0L)
  private fun resetAllProgress(config: Config) = config.plans.forEach { resetProgress(it.id) }
  private fun clearAllUnlocks(config: Config) = config.plans.forEach { clearUnlock(it.id) }

  companion object {
    private const val KEY_CONFIG = "reward_blocker_config"
    private const val KEY_PRODUCTIVE_ELAPSED_MS = "reward_blocker_productive_elapsed_ms"
    private const val KEY_UNLOCK_ENDS_AT_MS = "reward_blocker_unlock_ends_at_ms"
    private const val KEY_PRODUCTIVE_ELAPSED_BY_PLAN = "reward_blocker_productive_elapsed_by_plan"
    private const val KEY_UNLOCK_ENDS_BY_PLAN = "reward_blocker_unlock_ends_by_plan"
    private const val MINUTE_MS = 60_000L
    private val ALL_WEEKDAYS = (1..7).toSet()

    fun validate(
      enabled: Boolean,
      blockedPackages: Collection<String>,
      productivePackages: Collection<String>,
      startMinute: Int,
      endMinute: Int,
      productiveMinutes: Int,
      unlockMinutes: Int,
      weekdays: Collection<Int> = ALL_WEEKDAYS,
    ) {
      require(!enabled || blockedPackages.isNotEmpty()) { "Select at least one app to block." }
      require(!enabled || productivePackages.isNotEmpty()) { "Select at least one replacement app." }
      require(startMinute in 0..1439 && endMinute in 0..1439 && startMinute != endMinute) { "Schedule times must be different minutes between 0 and 1439." }
      require(weekdays.isNotEmpty() && weekdays.all { it in 1..7 }) { "Schedule weekdays must contain values between 1 and 7." }
      require(productiveMinutes > 0 && unlockMinutes > 0) { "Productive and unlock durations must be at least one minute." }
    }

    fun validatePlans(plans: Collection<Plan>) {
      require(plans.map { it.id }.toSet().size == plans.size) { "Plan ids must be unique." }
      plans.forEach {
        require(it.mode in setOf("focus", "sleep", "work")) { "Plan mode must be focus, sleep, or work." }
        validate(it.enabled, it.blockedPackages, it.productivePackages, it.startMinute, it.endMinute, it.productiveMinutes, it.unlockMinutes, it.weekdays)
      }
      val enabledPlans = plans.filter { it.enabled }
      for (firstIndex in enabledPlans.indices) for (secondIndex in firstIndex + 1 until enabledPlans.size) {
        val first = enabledPlans[firstIndex]
        val second = enabledPlans[secondIndex]
        require(!schedulesOverlap(first, second)) { "Enabled plans cannot have overlapping schedules." }
      }
    }

    private fun schedulesOverlap(first: Plan, second: Plan): Boolean = (1..7).any { weekday ->
      (0 until 1440).any { minute -> activeAt(first, weekday, minute) && activeAt(second, weekday, minute) }
    }

    private fun activeAt(plan: Plan, weekday: Int, minute: Int): Boolean {
      if (plan.startMinute < plan.endMinute) {
        return weekday in plan.weekdays && minute >= plan.startMinute && minute < plan.endMinute
      }
      val scheduleWeekday = if (minute >= plan.startMinute) weekday else if (weekday == 1) 7 else weekday - 1
      return scheduleWeekday in plan.weekdays && (minute >= plan.startMinute || minute < plan.endMinute)
    }
  }
}
