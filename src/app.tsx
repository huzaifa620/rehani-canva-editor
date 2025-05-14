import { Button, Rows, Text } from "@canva/app-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { addPage, addElementAtPoint } from "@canva/design";
import { useState } from "react";

export const App = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listings = [
    {
      rehani_id: "1-bedroom-apt-in-kenya",
      image:
        "https://rehani-s3.s3.amazonaws.com/listings/gomolemokhaba/compressed_images/IMG-20250406-WA0005_0739cfdf.jpg",
    },
    {
      rehani_id: "3-bedroom-apt-in-kenya",
      image:
        "https://rehani-s3.s3.amazonaws.com/listings/viyer46995/compressed_images/tree-9448275_4a500c17.jpg",
    },
  ];

  const onClick = async () => {
    setLoading(true);
    setError(null);

    try {
      for (let index = 0; index < listings.length; index++) {
        const listing = listings[index];
        const base64 = await convertImageToBase64(listing.image);

        await addPage({
          title: listing.rehani_id,
          elements: [
            {
              type: "image",
              altText: undefined,
              dataUrl: base64,
              top: 0,
              left: 0,
              width: 1080,
              height: 1080,
            },
          ],
        });
      }
    } catch (err) {
      console.error("Image insertion failed:", err);
      setError("Something went wrong while inserting images.");
    }

    setLoading(false);
  };

  const convertImageToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          <FormattedMessage
            defaultMessage="Click to insert all listings as 1080x1080 Instagram-style pages"
            description="Instructional text"
          />
        </Text>

        <Button variant="primary" onClick={onClick} stretch disabled={loading}>
          {loading
            ? intl.formatMessage({ defaultMessage: "Uploading..." })
            : intl.formatMessage({ defaultMessage: "Insert Listings" })}
        </Button>

        {loading && <Text>⏳ Uploading images...</Text>}
        {error && <Text>{error}</Text>}
      </Rows>
    </div>
  );
};
