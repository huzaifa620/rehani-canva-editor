import { Button, Rows, Text } from "@canva/app-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { addElementAtPoint } from "@canva/design";
import { useState } from "react";

export const App = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const imageUrl =
        "https://rehani-s3.s3.amazonaws.com/listings/viyer46995/compressed_images/tree-9448275_4a500c17.jpg";
      const base64 = await convertImageToBase64(imageUrl);

      // Insert image at a defined point with fixed size (Instagram post size)
      await addElementAtPoint({
        type: "image",
        altText: undefined,
        dataUrl: base64,
        top: 0,
        left: 0,
        width: 1080,
        height: 1080,
      });
    } catch (err) {
      console.error("Image insertion failed:", err);
      setError("Failed to insert image.");
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
            defaultMessage="Click to insert a 1080x1080 image like Instagram post"
            description="Instructional text"
          />
        </Text>

        <Button variant="primary" onClick={onClick} stretch disabled={loading}>
          {loading
            ? intl.formatMessage({ defaultMessage: "Uploading..." })
            : intl.formatMessage({ defaultMessage: "Insert Image" })}
        </Button>

        {loading && <Text>⏳ Uploading image...</Text>}
        {error && <Text>{error}</Text>}
      </Rows>
    </div>
  );
};
