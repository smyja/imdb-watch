import { IconHeart, IconShare } from "@tabler/icons-react";
import {
  Card,
 Image,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  SimpleGrid,
  BackgroundImage,
  Center,
} from "@mantine/core";
import classes from "./BadgeCard.module.css";
import html2canvas from "html2canvas";
import { useRef } from "react";

type ReportData = {
    movie_report: {
      total_items_watched: number;
      average_rating: number;
      most_watched_genre: string;
      highest_rated_items: {
        title: string;
        poster_url: string;
      }[];
    };
  
    series_report: {
      total_items_watched: number;
      average_rating: number;
      most_watched_genre: string;
      highest_rated_items: {
        title: string;
        poster_url: string;
      }[];
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
              scale: 4,
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
          }, 4000);
        } catch (error) {
          console.error("Error sharing the image:", error);
        }
      }
    };
    const badgeData = [
      {
        label: "Movies Watched:",
        value: reportData.total_movies_watched,
        badgeColor: "black",
      },
  
      {
        label: "Series Watched:",
        value: reportData.total_series_watched,
        badgeColor: "black",
      },
  
      {
        label: "Total Watch Time:",
        value: `${reportData.total_watch_time_hours.toFixed(2)} hours`,
        badgeColor: "pink",
      },
  
      {
        label: "Highest Rated Movies:",
        value: reportData.movie_report.highest_rated_items.map(item => item.title).join(", "),
        badgeColor: "yellow",
        variant: "filled",
      },
  
      {
        label: "Highest Rated Series:",
        value: reportData.series_report.highest_rated_items.map(item => item.title).join(", "),
        badgeColor: "blue",
      },
    ];
    const images = [

        'http://127.0.0.1:8000/proxy-image/?url=' + encodeURIComponent(reportData.movie_report.highest_rated_items[0].poster_url),
      
        'http://127.0.0.1:8000/proxy-image/?url=' + encodeURIComponent(reportData.movie_report.highest_rated_items[1].poster_url),
      
        'http://127.0.0.1:8000/proxy-image/?url=' + encodeURIComponent(reportData.series_report.highest_rated_items[0].poster_url),

      
      ];
    return (
      <Card withBorder radius="md" p="md" className={classes.card} ref={cardRef}>
        <Card.Section>
          <BackgroundImage
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
            radius="sm"
            h={160}
          >
            <Center pt="60">
              <Text c="#fff781" fz={30}>
               2023 IMDB Wrapped
              </Text>
            </Center>
          </BackgroundImage>
        </Card.Section>
        <Card.Section className={classes.section} mt="md">
          {badgeData.map((data, index) => (
            <Group
              justify="apart"
              mt={index === 0 ? "md" : "xs"}
              key={data.label}
            >
              <Badge color={data.badgeColor} variant={data.variant || "filled"}>
                {data.label}
              </Badge>
  
              <Text fz="lg" fw={500}>
                {data.value}
              </Text>
            </Group>
          ))}
        </Card.Section>
        <Card.Section inheritPadding mt="sm" pb="md">
          <SimpleGrid cols={3}>
            {images.map((image) => (
              <Image src={image} key={image} radius={"md"} alt="t" />
            ))}
          </SimpleGrid>
        </Card.Section>
        <Group mt="xs">
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