import UIKit
import Capacitor
import os.log
import FirebaseCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Firebase init (μέσα στη μέθοδο)
    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
    }

    // Logs
    os_log("🍎 ForMyPet iOS: AppDelegate didFinishLaunching", log: .default, type: .info)
    os_log("🍎 ForMyPet iOS: iOS Version: %@, Device: %@", log: .default, type: .info,
           UIDevice.current.systemVersion, UIDevice.current.model)

    return true
  }

  func applicationWillResignActive(_ application: UIApplication) { }
  func applicationDidEnterBackground(_ application: UIApplication) { }
  func applicationWillEnterForeground(_ application: UIApplication) { }
  func applicationDidBecomeActive(_ application: UIApplication) { }
  func applicationWillTerminate(_ application: UIApplication) { }

  // Deep links / Capacitor
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
  }

  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return ApplicationDelegateProxy.shared.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}
