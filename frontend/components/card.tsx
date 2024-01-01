import { IconHeart,IconShare } from '@tabler/icons-react';
import { Card, Image, Text, Group, Badge, Button, ActionIcon } from '@mantine/core';
import classes from './BadgeCard.module.css';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

const mockdata = {
  image:
    'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
  title: 'Verudela Beach',
  country: 'Croatia',
  description:
    'Completely renovated for the season 2020, Arena Verudela Bech Apartments are fully equipped and modernly furnished 4-star self-service apartments located on the Adriatic coastline by one of the most beautiful beaches in Pula.',
  badges: [
    { emoji: '☀️', label: 'Sunny weather' },
    { emoji: '🦓', label: 'Onsite zoo' },
    { emoji: '🌊', label: 'Sea' },
    { emoji: '🌲', label: 'Nature' },
    { emoji: '🤽', label: 'Water sports' },
  ],
};

export function BadgeCard() {
    const cardRef = useRef<HTMLDivElement>(null); // Create a ref for the card element

    const shareImage = async () => {
        const cardElement = cardRef.current;
        if (cardElement) {
          try {
            if (document.fonts) {
                await document.fonts.ready;
            }
            // Delay the screenshot by 1 second (1000 milliseconds)
            setTimeout(async () => {
            const rect = cardElement.getBoundingClientRect(); 
              const options = {
                scale: window.devicePixelRatio,
                useCORS: true, // This can help with loading images from other domains
                letterRendering: true,
                // ... other options you might need
                width: rect.width, // Set the width of the canvas based on the element's width
                height: rect.height, // Set the height of the canvas based on the element's height
                // ... other options you might need
              };
      
              const canvas =  await html2canvas(cardRef.current as HTMLElement, options);
              const image = canvas.toDataURL('image/png');
      
              if (navigator.share) {
                await navigator.share({
                  files: [new File([image], 'share.png', { type: 'image/png' })],
                  title: 'Check out this place!',
                  text: 'I found this amazing place, have a look!',
                });
              } else {
                const link = document.createElement('a');
                link.href = image;
                link.download = 'share.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }, 1000);
          } catch (error) {
            console.error('Error sharing the image:', error);
          }
        }
      };
  
  const { image, title, description, country, badges } = mockdata;
  const features = badges.map((badge) => (
    <Badge variant="light" key={badge.label} leftSection={badge.emoji}>
      {badge.label}
    </Badge>
  ));

  return (
    <Card withBorder radius="md" p="md" className={classes.card} ref={cardRef}>
      <Card.Section>
        <Image src={image} alt={title} height={180} />
      </Card.Section>

      <Card.Section className={classes.section} mt="md">
        <Group justify="apart">
          <Text fz="lg" fw={500} variant="light">
            {title}
          </Text>
          <Badge size="sm" variant="light">
            {country}
          </Badge>
        </Group>
        <Text fz="sm" mt="xs">
          {description}
        </Text>
      </Card.Section>

      <Card.Section className={classes.section}>
        <Text mt="md" className={classes.label} c="dimmed">
          Perfect for you, if you enjoy
        </Text>
        <Group gap={7} mt={5}>
          {features}
        </Group>
      </Card.Section>

      <Group mt="xs">
        <Button radius="md" style={{ flex: 1 }}>
          Show details
        </Button>
        <ActionIcon variant="default" radius="md" size={36}>
          <IconHeart className={classes.like} stroke={1.5} />
        </ActionIcon>
        <ActionIcon variant="default" radius="md" size={36} onClick={shareImage}>
  <IconShare className={classes.share} stroke={1.5} />
</ActionIcon>
      </Group>
    </Card>
  );
}