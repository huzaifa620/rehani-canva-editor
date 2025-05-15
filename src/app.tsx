import { Button, Rows, Text } from "@canva/app-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { addPage, addElementAtPoint, getCurrentPageContext, requestExport } from "@canva/design";
import { useState } from "react";

export const App = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const listings = [
    {
      rehani_id: "1-bedroom-apt-in-kenya",
      image: "https://rehani-s3.s3.amazonaws.com/listings/gomolemokhaba/compressed_images/IMG-20250406-WA0005_0739cfdf.jpg",
    },
    {
      rehani_id: "3-bedroom-apt-in-kenya",
      image: "https://rehani-s3.s3.amazonaws.com/listings/viyer46995/compressed_images/tree-9448275_4a500c17.jpg",
    },
  ];

  const onClick = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

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
      setSuccess("Pages created successfully! Now you can export them.");
    } catch (err) {
      console.error("Image insertion failed:", err);
      setError("Something went wrong while inserting images.");
    } finally {
      setLoading(false);
    }
  };

  // 2. New export function
  const exportToWebApp = async () => {
    setExporting(true);
    setError(null);
    
    try {
      const context = await getCurrentPageContext();
      
      if (!context) {
        throw new Error("No active design context found");
      }
      
      const result = await requestExport({
        acceptedFileTypes: ["jpg", "png", "gif", "video", "svg"],
      });
      console.log('first2', result)
      if (result.status === "completed") {
        const exportedImages = await Promise.all(
          result.exportBlobs.map(async (exportedImage) => {
            const response = await fetch(exportedImage.url);
            const blob = await response.blob();
            return {
              name: exportedImage.url,
              blob: blob
            };
          })
        );

        setSuccess(`Successfully exported ${exportedImages.length} images`);
        console.log("Exported images:", exportedImages);
        
      }
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
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

        <Button 
          variant="primary" 
          onClick={onClick} 
          stretch 
          disabled={loading}
        >
          {loading
            ? intl.formatMessage({ defaultMessage: "Uploading..." })
            : intl.formatMessage({ defaultMessage: "Insert Listings" })}
        </Button>

        {success && <Text>{success}</Text>}
        {error && <Text>{error}</Text>}

        {/* New Export Button - only show after successful creation */}
        {success && (
          <Button
            variant="secondary"
            onClick={exportToWebApp}
            stretch
            disabled={exporting}
          >
            {exporting
              ? intl.formatMessage({ defaultMessage: "Exporting..." })
              : intl.formatMessage({ defaultMessage: "Export to Web App" })}
          </Button>
        )}

        {exporting && <Text>⏳ Exporting images...</Text>}
      </Rows>
    </div>
  );
};