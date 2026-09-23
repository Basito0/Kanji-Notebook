module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'electron_quick_start',
        // Dynamically assign or skip signing configurations based on available variables
        ...(process.env.CERTIFICATE_PASSWORD ? {
          certificateFile: './cert.pfx',
          certificatePassword: process.env.CERTIFICATE_PASSWORD
        } : {})
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {}
    }
  ]
};
