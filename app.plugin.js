const { AndroidConfig, createRunOncePlugin, withInfoPlist } = require('expo/config-plugins');

const pkg = require('./package.json');

const DEFAULT_CAMERA_PERMISSION = 'Allow this app to capture receipts for OCR scanning.';

function withExpoOcrKit(config, props = {}) {
  const cameraPermission = props.cameraPermission || DEFAULT_CAMERA_PERMISSION;

  config = withInfoPlist(config, (modConfig) => {
    modConfig.modResults.NSCameraUsageDescription =
      modConfig.modResults.NSCameraUsageDescription || cameraPermission;
    return modConfig;
  });

  config = AndroidConfig.Permissions.withPermissions(config, ['android.permission.CAMERA']);

  return config;
}

module.exports = createRunOncePlugin(withExpoOcrKit, pkg.name, pkg.version);
