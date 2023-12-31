import cx from 'clsx';
import { Title, Text, Container, Button, Overlay,FileButton } from '@mantine/core';
import classes from './HeroImageBackground.module.css';
import { useState } from 'react';

export function HeroImageBackground() {
    const [file, setFile] = useState<File | null>(null);
  return (
    <div className={classes.wrapper}>
      <Overlay color="#000" opacity={0.65} zIndex={1} />

      <div className={classes.inner}>
        <Title className={classes.title}>
         IMDB Wrapped{' '}
        
        </Title>

        <Container size={640}>
          <Text size="lg" className={classes.description}>
           2023 IMDB wrapped for watched movies and shows
          </Text>
        </Container>

        <div className={classes.controls}>
        <FileButton onChange={setFile} accept="image/png,image/jpeg">
          {(props) => <Button {...props}>Upload image</Button>}
        </FileButton>
     
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