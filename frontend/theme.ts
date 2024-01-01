import { createTheme } from "@mantine/core";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ["latin"] });
export const theme = createTheme({
  /* Put your mantine theme override here */
  fontFamily: "Inter, sans-serif",
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: { fontFamily: 'Inter, sans-serif' },
});
