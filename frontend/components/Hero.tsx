// HeroImageBackground.jsx
import {
    Title,
    Text,
    Container,
    Button,
    Overlay,
    FileButton,
    Group
  } from "@mantine/core";
  import classes from "./HeroImageBackground.module.css";
  import { useState } from "react";
  
  export function HeroImageBackground({ onFileChange, onGenerateReport }) {
    const [file, setFile] = useState<File | null>(null);
  
    const handleFileSelect = (file: File | null) => {
      setFile(file);
      if (file) {
        onFileChange(file); // Call the handler passed via props
      }
    };
  
    return (
      <div className={classes.wrapper}>
        <Overlay color="#000" opacity={0.65} zIndex={1} />
  
        <div className={classes.inner}>
          <Title className={classes.title}>IMDB Wrapped </Title>
  
          <Container size={640}>
            <Text size="lg" className={classes.description}>
              2023 IMDB wrapped for watched movies and shows
            </Text>
          </Container>
  
          <div className={classes.controls}>
            <Group>    
                 <FileButton onChange={handleFileSelect} accept=".csv">
              {(props) => <Button {...props}>Select CSV</Button>}
            </FileButton>
            {file && (
              <Button
                onClick={onGenerateReport}
                style={{ marginLeft: 20 }}
              >
                Generate Report
              </Button>
            )}
            </Group>
       
          </div>
          {file && (
            <Text size="sm" ta="center" mt="sm" c="white">
              Picked file: {file.name}
            </Text>
          )}
        </div>
      </div>
    );
  }