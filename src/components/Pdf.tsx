import React from 'react';
import { PDFViewer, Font, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

import {useSelector} from '../store';
import './Pdf.scss';

Font.register({
  family: 'Radley',
  src: "http://fonts.gstatic.com/s/radley/v9/oYPm6FM24pD5d8aNal8WhQ.ttf",
});

/**
 * Styles for the PDF.
 *
 * Optimized for 8.5x11 inch paper.
 */
const STYLES = StyleSheet.create({
  page: {
    fontFamily: 'Radley',
    flexDirection: 'row',
    marginTop: "0.25in",
    marginBottom: "0.5in",
    marginLeft: "0.75in",
    marginRight: "0.75in",
  },
  header: {
    textAlign: 'center',
    height: "0.75in",
  },
  headText: {
    paddingBottom: "0.25in",
    fontSize: 16,
    width: '7in',
    borderBottom: "1px solid #eee",
  },
  grid: {
    position: "absolute",
    top: "1in",
    left: "1.75in",
    width: "3.5in",
    height: "3.5in",
    border: "1px solid #000",
  },
  clueIdx: {
    paddingLeft: `${1/48}in`,
    fontSize: 8,
  },
  clues: {
    paddingTop: "0.25in",
    borderTop: "1px solid #eee",
    position: "absolute",
    top: "5.25in",
    width: "7in",
    height: "5in",
    flexDirection: "row",
    flexWrap: "nowrap",
    flex: 1,
    fontSize: 12,
  },
  clueHdr: {
    fontWeight: "bold",
    lineHeight: "1.5",
  },
  clueCol: {
    width: "3.5in",
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  clueWrap: {
    flexShrink: 1,
    flexGrow: 1,
    flex: "1",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  clueNum: {
    fontWeight: "bold",
    marginRight: "0.1in",
  },
  clue: {
    width: "2.5in",
    lineHeight: "1",
  },
});

/**
 * A clue to view in the UI.
 */
type ClueItem = {
  num: number;
  clue: string;
};

/**
 * Render puzzle as a PDF file.
 */
export const Pdf = () => {
  const grid = useSelector((state) => state.grid);
  const blockWidth = 3.5 / grid.width; // inches
  const blockHeight = 3.5 / grid.height; // inches
  const ppi = 96; // pixels per inch
  const onePx = 1 / ppi; // inches

  const acrossClues: ClueItem[] = [];
  const downClues: ClueItem[] = [];
  for (let i = 0; i < grid.clues.length; i++) {
    const clue = grid.clues[i];
    if (clue.across) {
      acrossClues.push({num: i + 1, clue: clue.across});
    }
    if (clue.down) {
      downClues.push({num: i + 1, clue: clue.down});
    }
  }

  return (
    <div className="Pdf">
      <PDFViewer>
        <Document>
          <Page size="LETTER" style={STYLES.page}>
            <View style={STYLES.header}>
              <Text style={STYLES.headText}>{grid.title}</Text>
            </View>
            <View style={STYLES.grid}>
              {grid.content.map((cell, i) => {
                const rowIndex = Math.floor(i / grid.width);
                const colIndex = i % grid.width;
                return (
                  <View key={i} style={{
                    position: "absolute",
                    top: `${rowIndex * blockHeight - onePx}in`,
                    left: `${colIndex * blockWidth - onePx}in`,
                    width: `${blockWidth + 2 * onePx}in`,
                    height: `${blockHeight + 2 * onePx}in`,
                    border: `${onePx * 1.25}in solid #000`,
                    backgroundColor: cell.type === "BLOCK" ? "#000000" : "#FFFFFF",
                  }}>
                    {cell.startOfWord ? <Text style={STYLES.clueIdx}>{cell.startClueIdx! + 1}</Text> : null}
                    {/* TODO - answer here, optionally */}
                  </View>
                );
              })}
            </View>
            <View style={STYLES.clues}>
              <View style={STYLES.clueCol}>
              <Text style={STYLES.clueHdr}>ACROSS</Text>
              {acrossClues.map(clue => (
                <View style={STYLES.clueWrap} key={clue.num}>
                  <Text style={STYLES.clueNum}>{clue.num}</Text>
                  <Text style={STYLES.clue}>{clue.clue}</Text>
                </View>
              ))}
              </View>
              <View style={STYLES.clueCol}>
              <Text style={STYLES.clueHdr}>DOWN</Text>
              {downClues.map(clue => (
                <View style={STYLES.clueWrap} key={clue.num}>
                  <Text style={STYLES.clueNum}>{clue.num}</Text>
                  <Text style={STYLES.clue}>{clue.clue}</Text>
                </View>
              ))}
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}
