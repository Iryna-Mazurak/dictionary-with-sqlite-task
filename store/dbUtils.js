
import * as SQLite from "expo-sqlite";

export const database = SQLite.openDatabase("dictionary.db");

function executeSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      reject
    );
  });
}

export async function init() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS words (
      word TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS theme (
      id INTEGER PRIMARY KEY NOT NULL,
      isDark INTEGER NOT NULL
    );
  `);

  await executeSql(
    "INSERT OR IGNORE INTO theme (id, isDark) VALUES (1, 1)"
  );
}

export async function addWord(word) {
  await executeSql(
    "INSERT OR REPLACE INTO words (word, data) VALUES (?, ?)",
    [word.word, JSON.stringify(word)]
  );
}

export async function updateWord(word) {
  await executeSql(
    "UPDATE words SET data = ? WHERE word = ?",
    [JSON.stringify(word), word.word]
  );
}

export async function deleteWord(wordText) {
  await executeSql(
    "DELETE FROM words WHERE word = ?",
    [wordText]
  );
}

export async function getWords() {
  const result = await executeSql("SELECT data FROM words");

  return result.rows._array.map(({ data }) => JSON.parse(data));
}

export async function getTheme() {
  const result = await executeSql(
    "SELECT isDark FROM theme WHERE id = 1"
  );

  const row = result.rows.item(0);

  return row ? Boolean(row.isDark) : true;
}

export async function setTheme(isDark) {
  await executeSql(
    "INSERT OR REPLACE INTO theme (id, isDark) VALUES (1, ?)",
    [isDark ? 1 : 0]
  );
}
