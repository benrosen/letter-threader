import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const getShuffledItems = <GenericArrayOfUnknownItems extends unknown[]>(
  array: GenericArrayOfUnknownItems
): GenericArrayOfUnknownItems => {
  return array
    .map((value) => ({
      value,
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value) as GenericArrayOfUnknownItems;
};

const getRandomItem = <GenericItemType extends unknown>(
  array: GenericItemType[]
): GenericItemType => {
  return array[Math.floor(Math.random() * array.length)];
};

type Glyph =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "ER"
  | "TH"
  | "HE"
  | "QU"
  | "AN"
  | "IN"
  | "_";

const glyphCollections: Glyph[][] = [
  ["ER", "TH", "HE", "QU", "AN", "IN"],
  ["T", "E", "S", "P", "I", "L"],
  ["S", "S", "S", "N", "U", "E"],
  ["R", "O", "H", "D", "N", "L"],
  ["A", "A", "A", "F", "S", "R"],
  ["E", "E", "A", "G", "M", "U"],
  ["E", "E", "E", "E", "A", "A"],
  ["F", "S", "I", "R", "A", "A"],
  ["C", "N", "C", "E", "S", "T"],
  ["Z", "B", "B", "J", "K", "X"],
  ["F", "R", "Y", "S", "A", "I"],
  ["P", "T", "S", "E", "I", "C"],
  ["M", "A", "N", "G", "N", "E"],
  ["D", "T", "N", "H", "O", "D"],
  ["T", "E", "T", "M", "T", "O"],
  ["W", "O", "N", "D", "H", "H"],
  ["N", "N", "N", "E", "A", "D"],
  ["S", "Y", "R", "Y", "P", "I"],
  ["R", "R", "G", "V", "O", "W"],
  ["O", "O", "O", "T", "T", "U"],
  ["T", "T", "I", "I", "I", "E"],
  ["L", "O", "H", "D", "H", "R"],
  ["I", "T", "E", "L", "S", "I"],
  ["E", "A", "E", "M", "E", "E"],
  ["O", "T", "O", "U", "W", "N"],
];

const glyphValues: { [glyph in Glyph]: number } = {
  A: 2,
  B: 8,
  C: 8,
  D: 5,
  E: 2,
  F: 6,
  G: 6,
  H: 7,
  I: 2,
  J: 13,
  K: 8,
  L: 3,
  M: 5,
  N: 5,
  O: 2,
  P: 6,
  Q: 15,
  R: 5,
  S: 3,
  T: 3,
  U: 4,
  V: 11,
  W: 10,
  X: 12,
  Y: 4,
  Z: 14,
  ER: 7,
  TH: 9,
  QU: 9,
  IN: 7,
  AN: 7,
  HE: 9,
  _: 0,
};

export const App = () => {
  const [, setDictionary] = useState<string[]>([]);

  useEffect(() => {
    fetch("letter-threader/dictionary.txt")
      .then((response) => {
        return response.text();
      })
      .then((lines) => {
        setDictionary(() => {
          return lines.split("\n").map((line) => {
            return line.trim().toLowerCase();
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const isEnglishWord = useCallback((value: string): boolean => {
    value.toLowerCase();

    // return dictionary.includes(lowercaseValue);

    return true;
  }, []);

  const [startedAt, setStartedAt] = useState<number>(Date.now());

  const [glyphs, setGlyphs] = useState<Glyph[][]>([[], [], [], [], []]);

  useEffect(() => {
    setGlyphs(
      getShuffledItems(glyphCollections)
        .map((glyphCollection) => getRandomItem(glyphCollection))
        .reduce(
          (rows, glyph, index) => {
            rows[Math.floor(index / 5)].push(glyph);
            return rows;
          },
          [[], [], [], [], []] as Glyph[][]
        )
    );
  }, [startedAt]);

  const [composition, setComposition] = useState<
    { glyph: Glyph; rowIndex: number; columnIndex: number }[]
  >([]);

  const [, setElapsedTime] = useState<number>(0);

  const [isSkipMode, setIsSkipMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startedAt);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startedAt]);

  const [hoveredCoordinates, setHoveredCoordinates] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  const words = useMemo<
    { glyphs: Glyph[]; isValid: boolean; value: number }[]
  >(() => {
    return composition.reduce<
      {
        glyphs: Glyph[];
        isValid: boolean;
        value: number;
      }[]
    >(
      (words, { glyph }) => {
        if (glyph === "_") {
          return [...words, { glyphs: [], isValid: false, value: 0 }];
        }

        const glyphs = words[words.length - 1].glyphs;

        glyphs.push(glyph);

        const word = glyphs.join("");

        const isValid = isEnglishWord(word);

        const value = isValid
          ? glyphs.reduce<number>((total, glyph) => {
              const glyphValue = glyphValues[glyph];

              return total + glyphValue;
            }, 0)
          : 0;

        words[words.length - 1] = { glyphs, isValid, value };

        return words;
      },
      [{ glyphs: [], isValid: false, value: 0 }]
    );
  }, [composition, isEnglishWord]);

  const score = useMemo(() => {
    return words.reduce<number>((total, { value }) => {
      return total + value;
    }, 0);
  }, [words]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          height: "485px",
          maxWidth: "300px",
          padding: "1rem",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "right",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
            }}
          >
            {score}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "2rem",
            display: "block",
            maxWidth: "15rem",
            wordBreak: "break-word",
            textTransform: "capitalize",
            fontFamily: "serif",
          }}
        >
          {words.map(({ glyphs, isValid }, index) => {
            const word = glyphs.join("").toLowerCase();

            return (
              <div key={`word${index}`}>
                <span
                  style={{
                    textDecoration: isValid ? undefined : "line-through",
                  }}
                >
                  {word}
                </span>
                <span> </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <table style={{ display: "inline-block" }}>
            <tbody>
              {glyphs.map((row, rowIndex) => {
                return (
                  <tr key={rowIndex}>
                    {row.map((glyph, columnIndex) => {
                      const newestGlyph =
                        composition[Math.max(0, composition.length - 1)];

                      const isAlreadyInUse = composition.some((item) => {
                        return (
                          item.columnIndex === columnIndex &&
                          item.rowIndex === rowIndex
                        );
                      });

                      const isMoreThanOneRowAwayFromNewestGlyph =
                        Math.abs(rowIndex - newestGlyph?.rowIndex) > 1;

                      const isMoreThanOneColumnAwayFromNewestGlyph =
                        Math.abs(columnIndex - newestGlyph?.columnIndex) > 1;

                      const index = composition.findIndex((item) => {
                        return (
                          item.rowIndex === rowIndex &&
                          item.columnIndex === columnIndex
                        );
                      });

                      const compositionGlyph = composition[index]?.glyph;

                      const isHovered =
                        hoveredCoordinates?.columnIndex === columnIndex &&
                        hoveredCoordinates?.rowIndex === rowIndex;

                      const isDisabled =
                        isAlreadyInUse ||
                        isMoreThanOneRowAwayFromNewestGlyph ||
                        isMoreThanOneColumnAwayFromNewestGlyph;

                      return (
                        <td key={columnIndex} style={{ textAlign: "center" }}>
                          <button
                            disabled={isDisabled}
                            style={{
                              fontSize: "1rem",
                              fontWeight: "800",
                              width: "3rem",
                              height: "3rem",
                              textAlign: "center",
                              backgroundColor: isAlreadyInUse
                                ? "white"
                                : undefined,
                            }}
                            onClick={() => {
                              setComposition((composition) => {
                                return [
                                  ...composition,
                                  {
                                    rowIndex,
                                    columnIndex,
                                    glyph: isSkipMode ? "_" : glyph,
                                  },
                                ];
                              });

                              setIsSkipMode(false);
                            }}
                            onMouseOver={() => {
                              setHoveredCoordinates({ rowIndex, columnIndex });
                            }}
                            onMouseLeave={() => {
                              setHoveredCoordinates(null);
                            }}
                          >
                            <sup
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "normal",
                                textDecoration: "none",
                              }}
                            >
                              {index + 1 > 0 ? index + 1 : null}
                            </sup>
                            {!isDisabled && isSkipMode && isHovered
                              ? "_"
                              : compositionGlyph
                              ? compositionGlyph
                              : glyph}
                            <sub
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "normal",
                                textDecoration: "none",
                              }}
                            >
                              {isSkipMode && isHovered
                                ? 0
                                : glyphValues[
                                    compositionGlyph ? compositionGlyph : glyph
                                  ]}
                            </sub>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <button
              disabled={composition.length < 1}
              onClick={() => {
                setIsSkipMode(false);

                setComposition((composition) => {
                  return composition.slice(
                    0,
                    Math.max(0, composition.length - 1)
                  );
                });
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                setStartedAt(Date.now());
                setElapsedTime(0);
                setComposition([]);
                setIsSkipMode(false);
              }}
            >
              New
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "0.25rem",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                id="isSkipMode"
                name="isSkipMode"
                checked={isSkipMode && composition.length > 0}
                disabled={composition.length < 1}
                onChange={() => {
                  setIsSkipMode((isSkipMode) => {
                    return !isSkipMode;
                  });
                }}
              />
              <label htmlFor="isSkipMode">Skip</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
