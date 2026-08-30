package expo.modules.appblocker

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorFilter
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PixelFormat
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import kotlin.math.max

/**
 * Canonical Android locker. The reward flow is intentionally native so it
 * remains above the blocked app while React Native is backgrounded.
 */
class OverlayManager(private val context: Context) {
  private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
  private val handler = Handler(Looper.getMainLooper())
  private val rewardController by lazy { RewardBlockerController(context) }
  private var overlayView: View? = null
  private var rewardCountdown: TextView? = null
  private var rewardProgressText: TextView? = null
  private var rewardProgressRing: RewardProgressView? = null
  private var rewardTicker: Runnable? = null

  fun show(blockedPackageName: String? = null, reason: BlockReason = BlockReason.OPENED) {
    if (overlayView != null) {
      updateRewardCountdown()
      return
    }
    val blockedAppName = blockedPackageName?.let(::resolveAppName) ?: ""
    val view = buildOverlayView(blockedAppName)
    try {
      windowManager.addView(view, buildLayoutParams())
      overlayView = view
      startRewardTicker()
    } catch (error: Exception) {
      Log.e(TAG, "Failed to add blocker overlay", error)
    }
  }

  fun hide() {
    rewardTicker?.let(handler::removeCallbacks)
    rewardTicker = null
    rewardCountdown = null
    rewardProgressText = null
    rewardProgressRing = null
    val view = overlayView ?: return
    try {
      windowManager.removeView(view)
    } catch (error: Exception) {
      Log.e(TAG, "Failed to remove blocker overlay", error)
    }
    overlayView = null
  }

  private fun resolveAppName(packageName: String): String = try {
    val packageManager = context.packageManager
    packageManager.getApplicationLabel(packageManager.getApplicationInfo(packageName, 0)).toString()
  } catch (_: Exception) {
    packageName
  }

  private fun buildOverlayView(blockedAppName: String): View {
    if (rewardController.isConfigured()) return buildRewardOverlayView(blockedAppName)
    val density = context.resources.displayMetrics.density
    fun dp(value: Float) = (value * density).toInt()
    return LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      background = ElectricIndigoBackgroundDrawable()
      setPadding(dp(28f), dp(54f), dp(28f), dp(30f))
      addView(buildBrandLogo { dp(it) }, LinearLayout.LayoutParams(dp(38f), dp(38f)).apply {
        gravity = Gravity.START
      })
      addView(TextView(context).apply {
        text = AppBlockerPrefs.getOverlayTitle(context)
        gravity = Gravity.CENTER
        setTextColor(Color.WHITE)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
        setTypeface(typeface, Typeface.BOLD)
      }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))
    }
  }

  private fun buildBrandLogo(dp: (Float) -> Int) = ImageView(context).apply {
    // Resolve through the module's generated R class. Dynamic lookup against the host app
    // can resolve to 0 when Android namespaces library resources.
    setImageResource(R.drawable.rehabbit_logo)
    // The asset is a white mark with transparency, so the indigo overlay shows through.
    scaleType = ImageView.ScaleType.FIT_CENTER
  }

  private fun buildRewardOverlayView(blockedAppName: String): View {
    val metrics = context.resources.displayMetrics
    val density = metrics.density
    fun dp(value: Float) = (value * density).toInt()
    val screenHeight = metrics.heightPixels / density
    val veryCompact = screenHeight < 620f
    val compact = screenHeight < 760f
    val horizontalPadding = when {
      veryCompact -> 18f
      compact -> 22f
      else -> 28f
    }
    val logoSize = when {
      veryCompact -> 34f
      compact -> 40f
      else -> 46f
    }
    val timerSizeDp = when {
      veryCompact -> 150f
      compact -> 206f
      else -> 236f
    }
    val appCardHeight = when {
      veryCompact -> 58f
      compact -> 66f
      else -> 72f
    }
    val ink = Color.WHITE
    val mutedInk = Color.parseColor("#E8ECFF")
    val status = rewardController.getStatus()
    val modeCopy = when (rewardController.activePlanMode()) {
      "sleep" -> Pair("Tu descanso empieza ahora", "$blockedAppName puede esperar. Tu sesión de descanso está en curso.")
      "work" -> Pair("Vuelve a lo que importa", "$blockedAppName puede esperar. Tu sesión de trabajo está en curso.")
      else -> Pair("Estás recuperando tu tiempo", "$blockedAppName puede esperar. Tu sesión de enfoque está en curso.")
    }

    return LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      background = ElectricIndigoBackgroundDrawable()
      setPadding(
        dp(horizontalPadding),
        dp(when { veryCompact -> 18f; compact -> 38f; else -> 48f }),
        dp(horizontalPadding),
        dp(when { veryCompact -> 10f; compact -> 16f; else -> 22f }),
      )

      addView(buildBrandLogo { dp(it) }, LinearLayout.LayoutParams(dp(logoSize), dp(logoSize)).apply {
        bottomMargin = dp(when { veryCompact -> 4f; compact -> 8f; else -> 12f })
        gravity = Gravity.START
      })

      val timerSize = dp(timerSizeDp)
      addView(FrameLayout(context).apply {
        addView(RewardProgressView(context).apply {
          setProgress(progressFraction(status))
          rewardProgressRing = this
        }, FrameLayout.LayoutParams(timerSize, timerSize))
        addView(LinearLayout(context).apply {
          orientation = LinearLayout.VERTICAL
          gravity = Gravity.CENTER
          addView(TextView(context).apply {
            text = formatDuration(status.productiveElapsedSeconds)
            setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, when { veryCompact -> 34f; compact -> 43f; else -> 48f })
            gravity = Gravity.CENTER
            rewardCountdown = this
          })
          addView(TextView(context).apply {
            text = progressLabel(status)
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.CENTER
            letterSpacing = 0.08f
            rewardProgressText = this
          })
        }, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
      }, LinearLayout.LayoutParams(timerSize, timerSize).apply {
        gravity = Gravity.CENTER_HORIZONTAL
      })

      addView(TextView(context).apply {
        text = modeCopy.first
        setTextColor(ink)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, when { veryCompact -> 18f; compact -> 20f; else -> 22f })
        setTypeface(typeface, Typeface.BOLD)
        gravity = Gravity.CENTER
      }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
        topMargin = dp(when { veryCompact -> 8f; compact -> 14f; else -> 20f })
      })
      addView(TextView(context).apply {
        text = modeCopy.second
        setTextColor(mutedInk)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, if (veryCompact) 14f else if (compact) 15f else 16f)
        gravity = Gravity.CENTER
        setLineSpacing(dp(3f).toFloat(), 1f)
      }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
        topMargin = dp(if (veryCompact) 5f else 8f)
      })

      addView(ScrollView(context).apply {
        clipToPadding = false
        isFillViewport = false
        isVerticalScrollBarEnabled = true
        overScrollMode = View.OVER_SCROLL_IF_CONTENT_SCROLLS
        setPadding(0, 0, 0, dp(6f))
        addView(LinearLayout(context).apply {
          orientation = LinearLayout.VERTICAL
          rewardController.productiveApps().forEach { app ->
            addView(buildFocusAppCard(app), LinearLayout.LayoutParams(
              LinearLayout.LayoutParams.MATCH_PARENT,
              dp(appCardHeight),
            ).apply { bottomMargin = dp(when { veryCompact -> 7f; compact -> 9f; else -> 11f }) })
          }
        }, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT))
      }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f).apply {
        topMargin = dp(when { veryCompact -> 8f; compact -> 14f; else -> 20f })
      })
    }
  }

  private fun buildFocusAppCard(app: RewardBlockerController.ProductiveApp): View {
    val density = context.resources.displayMetrics.density
    fun dp(value: Float) = (value * density).toInt()
    return LinearLayout(context).apply {
      gravity = Gravity.CENTER_VERTICAL
      isClickable = true
      contentDescription = "Abrir ${app.label}"
      setPadding(dp(15f), 0, dp(17f), 0)
      background = GradientDrawable(
        GradientDrawable.Orientation.TOP_BOTTOM,
        intArrayOf(Color.parseColor("#38FFFFFF"), Color.parseColor("#16FFFFFF")),
      ).apply {
        cornerRadius = dp(18f).toFloat()
        setStroke(dp(1f), Color.parseColor("#80FFFFFF"))
      }
      setOnClickListener { openFocusApp(app) }
      addView(ImageView(context).apply {
        background = GradientDrawable(
          GradientDrawable.Orientation.TOP_BOTTOM,
          intArrayOf(Color.parseColor("#42FFFFFF"), Color.parseColor("#1CFFFFFF")),
        ).apply {
          cornerRadius = dp(12f).toFloat()
          setStroke(dp(1f), Color.parseColor("#5CFFFFFF"))
        }
        setPadding(dp(7f), dp(7f), dp(7f), dp(7f))
        try { setImageDrawable(context.packageManager.getApplicationIcon(app.packageName)) } catch (_: Exception) { }
      }, LinearLayout.LayoutParams(dp(46f), dp(46f)))
      addView(TextView(context).apply {
        text = app.label
        setTextColor(Color.WHITE)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 19f)
        setTypeface(typeface, Typeface.BOLD)
        gravity = Gravity.CENTER_VERTICAL
      }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { leftMargin = dp(15f) })
      addView(TextView(context).apply {
        text = "→"
        setTextColor(Color.WHITE)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 30f)
        gravity = Gravity.CENTER
      }, LinearLayout.LayoutParams(dp(34f), LinearLayout.LayoutParams.MATCH_PARENT))
    }
  }

  private fun openFocusApp(app: RewardBlockerController.ProductiveApp) {
    val launchIntent = context.packageManager.getLaunchIntentForPackage(app.packageName) ?: return
    try {
      launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
      context.startActivity(launchIntent)
      hide()
    } catch (error: Exception) {
      Log.e(TAG, "Failed to open focus app", error)
    }
  }

  private fun startRewardTicker() {
    if (!rewardController.isConfigured()) return
    rewardTicker?.let(handler::removeCallbacks)
    rewardTicker = object : Runnable {
      override fun run() {
        updateRewardCountdown()
        handler.postDelayed(this, 1_000L)
      }
    }
    updateRewardCountdown()
    handler.postDelayed(rewardTicker!!, 1_000L)
  }

  private fun updateRewardCountdown() {
    val status = rewardController.getStatus()
    rewardCountdown?.text = formatDuration(status.productiveElapsedSeconds)
    rewardProgressText?.text = progressLabel(status)
    rewardProgressRing?.setProgress(progressFraction(status))
  }

  private fun progressFraction(status: RewardBlockerController.Status): Float {
    val total = status.productiveElapsedSeconds + status.productiveRemainingSeconds
    return if (total == 0) 0f else status.productiveElapsedSeconds.toFloat() / total
  }

  private fun progressLabel(status: RewardBlockerController.Status): String {
    val total = status.productiveElapsedSeconds + status.productiveRemainingSeconds
    val percent = if (total == 0) 0 else status.productiveElapsedSeconds * 100 / total
    return "$percent% DE ${formatSessionDuration(total)}"
  }

  private fun formatDuration(seconds: Int): String =
    "${seconds.coerceAtLeast(0) / 60}:${(seconds.coerceAtLeast(0) % 60).toString().padStart(2, '0')}"

  private fun formatSessionDuration(seconds: Int): String {
    val safeSeconds = seconds.coerceAtLeast(0)
    return "${(safeSeconds / 3600).toString().padStart(2, '0')}:${((safeSeconds % 3600) / 60).toString().padStart(2, '0')}:${(safeSeconds % 60).toString().padStart(2, '0')}"
  }

  private fun buildLayoutParams(): WindowManager.LayoutParams {
    @Suppress("DEPRECATION")
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else WindowManager.LayoutParams.TYPE_PHONE
    return WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      type,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT,
    ).apply { gravity = Gravity.TOP or Gravity.START }
  }

  companion object { private const val TAG = "ExpoAppBlocker" }
}

private class RewardProgressView(context: Context) : View(context) {
  private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.parseColor("#3DFFFFFF"); style = Paint.Style.STROKE; strokeCap = Paint.Cap.ROUND }
  private val progressPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE; style = Paint.Style.STROKE; strokeCap = Paint.Cap.ROUND }
  private val bounds = RectF()
  private var fraction = 0f

  fun setProgress(value: Float) { fraction = value.coerceIn(0f, 1f); invalidate() }

  override fun onDraw(canvas: Canvas) {
    val stroke = width * 0.018f
    trackPaint.strokeWidth = stroke
    progressPaint.strokeWidth = stroke
    val inset = stroke * 1.5f
    bounds.set(inset, inset, width - inset, height - inset)
    canvas.drawArc(bounds, -90f, 360f, false, trackPaint)
    if (fraction > 0f) canvas.drawArc(bounds, -90f, 360f * fraction, false, progressPaint)
  }
}

private class ElectricIndigoBackgroundDrawable : Drawable() {
  private val paint = Paint(Paint.ANTI_ALIAS_FLAG)

  override fun draw(canvas: Canvas) {
    val area = bounds
    paint.shader = LinearGradient(
      area.left.toFloat(),
      area.bottom.toFloat(),
      area.right.toFloat(),
      area.top.toFloat(),
      intArrayOf(Color.parseColor("#4F3AE0"), Color.parseColor("#483FFF"), Color.parseColor("#5B8CFF")),
      floatArrayOf(0f, 0.5f, 0.96f),
      Shader.TileMode.CLAMP,
    )
    canvas.drawRect(area.left.toFloat(), area.top.toFloat(), area.right.toFloat(), area.bottom.toFloat(), paint)

    paint.shader = RadialGradient(
      area.exactCenterX(),
      area.top + area.height() * 0.3f,
      max(area.width(), area.height()) * 0.56f,
      intArrayOf(Color.argb(26, 56, 189, 248), Color.TRANSPARENT),
      floatArrayOf(0f, 1f),
      Shader.TileMode.CLAMP,
    )
    canvas.drawRect(area.left.toFloat(), area.top.toFloat(), area.right.toFloat(), area.bottom.toFloat(), paint)
    paint.shader = null
  }

  override fun setAlpha(alpha: Int) {
    paint.alpha = alpha
  }

  override fun setColorFilter(colorFilter: ColorFilter?) {
    paint.colorFilter = colorFilter
  }

  @Deprecated("Deprecated in Android")
  override fun getOpacity() = PixelFormat.TRANSLUCENT
}
