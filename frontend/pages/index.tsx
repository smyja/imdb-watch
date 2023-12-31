import { useState } from 'react';
import { FileButton, Button, Group, Text } from '@mantine/core';
import { HeroImageBackground } from '../components/Hero';

export default function IndexPage() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
    <HeroImageBackground/>
      <Group justify="center">

      </Group>


    </>
  );
}