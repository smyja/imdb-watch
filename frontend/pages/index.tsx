// IndexPage.jsx
import { useState } from "react";
import { Button, Group, Box, Loader } from "@mantine/core";
import { HeroImageBackground } from "../components/Hero";
import { BadgeCard } from "../components/card";

export default function IndexPage() {
  const [file, setFile] = useState<File | null>(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile); // Update the file state
  };

  const handleGenerateReport = async () => {
    if (file) {
      setLoading(true); // Start loading

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/upload-csv/", {
          method: "POST",
          body: formData,
          // Include any necessary headers or body data for the request
        });

        if (response.ok) {
          const data = await response.json();
          setReportData(data); // Set the report data in state
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setLoading(false); // Stop loading regardless of the outcome
      }
    }
  };

  return (
    <>
      <HeroImageBackground onFileChange={handleFileChange} onGenerateReport={handleGenerateReport} />
   
      <Group justify="center" mt={30}>
        <Box w={370}>
          {loading && <Loader />} {/* Show a loader while fetching data */}
          {!loading && reportData && <BadgeCard reportData={reportData} />}
        </Box>
      </Group>
    </>
  );
}