// const dark = require("../src/plugin/light-to-dark-theme.ts");
// const light = require("../src/plugin/dark-to-light-theme.ts");

import { lightTheme } from "../src/plugin/light-to-dark-theme";
import { darkTheme } from "../src/plugin/dark-to-light-theme";
import { ComponentStyle, Theme } from "../src/common/types";

function checkThemeMappings(lightTheme: Theme, darkTheme: Theme) {
  const lightToDarkMissing: ComponentStyle[] = [];
  const darkToLightMissing: ComponentStyle[] = [];

  const lightKeys = Object.keys(lightTheme);
  const darkKeys = Object.keys(darkTheme);

  // Check for missing mappings in dark theme
  for (const lightKey of lightKeys) {
    const lightStyle = lightTheme[lightKey];
    const darkStyle = darkTheme[lightStyle.mapsToKey];
    if (!darkStyle) {
      lightToDarkMissing.push(lightStyle);
    }
  }

  // Check for missing mappings in light theme
  for (const darkKey of darkKeys) {
    const darkStyle = darkTheme[darkKey];
    const lightStyle = lightTheme[darkStyle.mapsToKey];
    if (!lightStyle) {
      darkToLightMissing.push(darkStyle);
    }
  }

  return {
    lightToDarkMissing,
    darkToLightMissing
  };
}

function validateThemes() {
  const { lightToDarkMissing, darkToLightMissing } = checkThemeMappings(lightTheme, darkTheme);

  if (!!lightToDarkMissing.length || !!darkToLightMissing.length) {
    !!lightToDarkMissing.length && console.log("‼️ Light to dark missing mappings:\n", lightToDarkMissing, "\n");
    !!darkToLightMissing.length && console.log("‼️ Dark to light missing mappings:\n", darkToLightMissing, "\n");

    return process.exit(1);
  }

  console.log("✅ All themes files is well");
}

validateThemes();
