package com.chalterho

import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.review.ReviewManagerFactory

class ReviewModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ReviewModule"
    }

    @ReactMethod
    fun requestReview(promise: Promise) {

        val activity = reactContext.currentActivity

        if (activity == null) {
            promise.reject(
                "NO_ACTIVITY",
                "Activity not available"
            )
            return
        }

        try {

            val reviewManager =
                ReviewManagerFactory.create(activity)

            val request =
                reviewManager.requestReviewFlow()

            request.addOnCompleteListener { requestInfo ->

                if (requestInfo.isSuccessful) {

                    val reviewInfo =
                        requestInfo.result

                    reviewManager
                        .launchReviewFlow(
                            activity,
                            reviewInfo
                        )
                        .addOnCompleteListener {
                            promise.resolve(true)
                        }

                } else {

                    promise.reject(
                        "REVIEW_ERROR",
                        "Unable to request Google Play review"
                    )
                }
            }

        } catch (e: Exception) {

            promise.reject(
                "REVIEW_EXCEPTION",
                e.message,
                e
            )
        }
    }
}