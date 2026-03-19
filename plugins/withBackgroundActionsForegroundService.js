const { withAndroidManifest } = require("@expo/config-plugins");

const SERVICE_NAME = "com.asterinet.react.bgactions.RNBackgroundActionsTask";
const FOREGROUND_SERVICE_TYPE = "dataSync";

const REQUIRED_PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
  "android.permission.WAKE_LOCK",
];

function ensureUsesPermission(manifest, permissionName) {
  const existing = manifest["uses-permission"] || [];
  const alreadyExists = existing.some(
    (item) => item?.$?.["android:name"] === permissionName,
  );

  if (!alreadyExists) {
    existing.push({
      $: {
        "android:name": permissionName,
      },
    });
  }

  manifest["uses-permission"] = existing;
}

function ensureBackgroundService(manifest) {
  const app = manifest.application?.[0];
  if (!app) return;

  const services = app.service || [];
  const serviceIndex = services.findIndex(
    (item) => item?.$?.["android:name"] === SERVICE_NAME,
  );

  const serviceEntry = {
    $: {
      "android:name": SERVICE_NAME,
      "android:exported": "false",
      "android:foregroundServiceType": FOREGROUND_SERVICE_TYPE,
      "tools:node": "merge",
      "tools:replace": "android:foregroundServiceType",
    },
  };

  if (serviceIndex >= 0) {
    const current = services[serviceIndex];
    services[serviceIndex] = {
      ...current,
      $: {
        ...(current.$ || {}),
        ...serviceEntry.$,
      },
    };
  } else {
    services.push(serviceEntry);
  }

  app.service = services;
}

module.exports = function withBackgroundActionsForegroundService(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults.manifest;

    manifest.$ = {
      ...(manifest.$ || {}),
      "xmlns:tools": "http://schemas.android.com/tools",
    };

    REQUIRED_PERMISSIONS.forEach((permission) => {
      ensureUsesPermission(manifest, permission);
    });

    ensureBackgroundService(manifest);

    return configWithManifest;
  });
};
