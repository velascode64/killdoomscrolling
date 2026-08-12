const { withAndroidManifest, withProjectBuildGradle } = require("expo/config-plugins");

const MARKER = "// Digital Break: align legacy dynamic icon module with Java 17";

module.exports = function withAndroidJvmTarget(config) {
  const appScheme = Array.isArray(config.scheme) ? config.scheme[0] : config.scheme;
  const devScheme = `exp+${config.slug}`;

  config = withProjectBuildGradle(config, (config) => {
    // Replace any earlier generated block so repeated prebuilds don't retain
    // obsolete Gradle callbacks.
    config.modResults.contents = config.modResults.contents.replace(
      /\n\/\/ Digital Break: align legacy dynamic icon module with Java 17[\s\S]*$/,
      ""
    );

    config.modResults.contents += `

${MARKER}
def dynamicIconProject = findProject(":expo-dynamic-app-icon")
if (dynamicIconProject != null) {
  dynamicIconProject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    kotlinOptions.jvmTarget = "17"
  }
  dynamicIconProject.tasks.withType(org.gradle.api.tasks.compile.JavaCompile).configureEach {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}
`;
    return config;
  });

  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    const aliases = application?.["activity-alias"] ?? [];

    for (const alias of aliases) {
      const filters = alias["intent-filter"] ?? [];
      const hasAppLink = filters.some((filter) =>
        filter.data?.some((data) => data.$?.["android:scheme"] === appScheme)
      );
      if (hasAppLink) continue;

      // Android aliases do not inherit MainActivity's deep-link filters. The
      // dynamic app icon module enables one alias and disables MainActivity,
      // so each alias must accept both normal and Expo dev-client links.
      filters.push({
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        category: [
          { $: { "android:name": "android.intent.category.DEFAULT" } },
          { $: { "android:name": "android.intent.category.BROWSABLE" } },
        ],
        data: [
          { $: { "android:scheme": appScheme } },
          { $: { "android:scheme": devScheme } },
        ],
      });
      alias["intent-filter"] = filters;
    }

    return config;
  });
};
