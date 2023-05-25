import { readFile, writeFile } from "fs";
import { resolve } from "path";
import xml from "xml";
import flatten from "lodash.flatten";

const normaliseStationName = (stationName) => {
  return stationName
    .replace(/[0-9]*/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
const normaliseStationCode = (stationCode) => {
  return stationCode.toLowerCase();
};

const getLanguageCodeInUrl = (languageCode, withTrailingSlash = true) => {
  if (languageCode === "en") {
    return "";
  }

  return `de${withTrailingSlash ? "/" : ""}`;
};

const BASE_PATH = `https://berlinairquality.com`;

const getStationUrl = (stationName, stationCode, languageCode) => {
  return `${BASE_PATH}/${getLanguageCodeInUrl(
    languageCode
  )}stations/${normaliseStationName(stationName)}/${normaliseStationCode(
    stationCode
  )}`;
};

const getStaticUrl = (path, languageCode) => {
  if (path === "/") {
    if (languageCode === "en") {
      return BASE_PATH;
    }

    return `${BASE_PATH}/${getLanguageCodeInUrl(languageCode, false)}`;
  }

  return `${BASE_PATH}/${getLanguageCodeInUrl(languageCode)}${path}`;
};

const languageCodes = ["en", "de"];

const staticPages = ["/", "stations"];

readFile(
  resolve("data", "stations.json"),
  { encoding: "utf-8" },
  (error, data) => {
    if (error) {
      console.error(error);
    } else {
      const stations = JSON.parse(data).map(({ name, code }) => ({
        name,
        code,
      }));

      const sitemapObject = {
        urlset: [
          {
            _attr: {
              xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
              "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
            },
          },
          ...flatten(
            staticPages.map((path) => {
              return languageCodes.map((languageCode) => ({
                url: [
                  {
                    loc: getStaticUrl(path, languageCode),
                  },
                  ...languageCodes.map((otherLanguageCode) => ({
                    "xhtml:link": [
                      {
                        _attr: {
                          rel: "alternate",
                          hreflang: otherLanguageCode,
                          href: getStaticUrl(path, otherLanguageCode),
                        },
                      },
                    ],
                  })),
                ],
              }));
            })
          ),

          ...flatten(
            stations.map(({ name, code }) => {
              return languageCodes.map((languageCode) => ({
                url: [
                  {
                    loc: getStationUrl(name, code, languageCode),
                  },
                  ...languageCodes.map((otherLanguageCode) => ({
                    "xhtml:link": [
                      {
                        _attr: {
                          rel: "alternate",
                          hreflang: otherLanguageCode,
                          href: getStationUrl(name, code, otherLanguageCode),
                        },
                      },
                    ],
                  })),
                ],
              }));
            })
          ),
        ],
      };

      const sitemap = xml(sitemapObject, { declaration: true, indent: "  " });

      writeFile(
        resolve("sitemap", "sitemap.xml"),
        sitemap,
        { encoding: "utf-8" },
        (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Sitemap generated");
          }
        }
      );
    }
  }
);
