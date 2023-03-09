import { writeFile } from "fs";
import { resolve } from "path";

const fetchStations = () => {
  return fetch("https://luftdaten.berlin.de/api/stations?active=true", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((stations) => {
      writeFile(
        resolve("data", "stations.json"),
        JSON.stringify(stations),
        (error) => {
          if (error) {
            throw error;
          }
        }
      );
    });
};

const fetchLqi = () => {
  return fetch("https://luftdaten.berlin.de/api/lqi", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((lqi) => {
      writeFile(resolve("data", "lqi.json"), JSON.stringify(lqi), (error) => {
        if (error) {
          throw error;
        }
      });
    });
};

console.log("Fetching stations and lqi started");
const fetchers = [fetchStations(), fetchLqi()];

try {
  await Promise.all(fetchers);

  console.log("Fetching stations and lqi completed");
} catch (error) {
  console.error("Fetching stations and lqi failed", error);
}
