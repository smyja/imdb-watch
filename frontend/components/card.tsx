import { IconHeart, IconShare } from "@tabler/icons-react";
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
} from "@mantine/core";
import classes from "./BadgeCard.module.css";
import html2canvas from "html2canvas";
import { useRef } from "react";


type ReportData = {
  movie_report: {
    total_items_watched: number;
    average_rating: number;
    most_watched_genre: string;
    highest_rated_items: string[];
  };

  series_report: {
    total_items_watched: number;
    average_rating: number;
    most_watched_genre: string;
    highest_rated_items: string[];
  };
  total_movies_watched: number;
  total_series_watched: number;
  total_watch_time_hours: number;
};

type BadgeCardProps = {
  reportData: ReportData;
};

export function BadgeCard({ reportData }: BadgeCardProps) {
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

          const canvas = await html2canvas(
            cardRef.current as HTMLElement,
            options
          );
          const image = canvas.toDataURL("image/png");

          if (navigator.share) {
            await navigator.share({
              files: [new File([image], "share.png", { type: "image/png" })],
              title: "Check out this place!",
              text: "I found this amazing place, have a look!",
            });
          } else {
            const link = document.createElement("a");
            link.href = image;
            link.download = "share.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }, 1000);
      } catch (error) {
        console.error("Error sharing the image:", error);
      }
    }
  };
  const movieTitle = reportData.movie_report.highest_rated_items.join(', ');

  const seriesTitle = reportData.series_report.highest_rated_items.join(', ');

  const totalWatchTime = reportData.total_watch_time_hours.toFixed(2);



  return (
    <Card withBorder radius="md" p="md" className={classes.card} ref={cardRef}>

    {/* Card content using reportData */}

    <Card.Section className={classes.section} mt="md">

      <Group justify="apart">

        <Text fz="lg" fw={500}>

          Movies Watched: {reportData.total_movies_watched}

        </Text>

        <Text fz="lg" fw={500}>

          Series Watched: {reportData.total_series_watched}

        </Text>

      </Group>

      <Text fz="sm" mt="xs">

        Total Watch Time: {totalWatchTime} hours

      </Text>

      <Text fz="sm" mt="xs">

        Highest Rated Movies: {movieTitle}

      </Text>

      <Text fz="sm" mt="xs">

        Highest Rated Series: {seriesTitle}

      </Text>

    </Card.Section>

      <Group mt="xs">
        <Button radius="md" style={{ flex: 1 }}>
          Show details
        </Button>
        <ActionIcon variant="default" radius="md" size={36}>
          <IconHeart className={classes.like} stroke={1.5} />
        </ActionIcon>
        <ActionIcon
          variant="default"
          radius="md"
          size={36}
          onClick={shareImage}
        >
          <IconShare className={classes.share} stroke={1.5} />
        </ActionIcon>
      </Group>
    </Card>
  );
}
