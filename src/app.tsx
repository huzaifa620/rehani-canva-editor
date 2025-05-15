import { Button, Rows, Text } from "@canva/app-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { addPage, getCurrentPageContext, requestExport } from "@canva/design";
import { useState } from "react";
import JSZip from "jszip";

export const App = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportedFiles, setExportedFiles] = useState<File[]>([]);

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
    setExportedFiles([]);

    try {
      for (const listing of listings) {
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

  const exportToWebApp = async () => {
    setExporting(true);
    setError(null);
    setExportedFiles([]);

    try {
      const context = await getCurrentPageContext();
      
      if (!context) {
        throw new Error("No active design context found");
      }
      
      const result = await requestExport({
        acceptedFileTypes: ["jpg", "png", "gif", "video", "svg"],
      });

      if (result.status === "completed") {
        const zipResponse = await fetch(result.exportBlobs[0].url);
        const zipBlob = await zipResponse.blob();
        const imageFiles = await extractFilesFromZip(zipBlob);
        
        setExportedFiles(imageFiles);
        console.log("Extracted image files:", imageFiles);
        setSuccess(`Successfully extracted ${imageFiles.length} images`);
      }
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const extractFilesFromZip = async (zipBlob: Blob): Promise<File[]> => {
    const zip = await JSZip.loadAsync(zipBlob);
    const imageFiles: File[] = [];

    await Promise.all(
      Object.keys(zip.files).map(async (filename) => {
        const zipFile = zip.files[filename];
        if (!zipFile.dir) {
          const fileBlob = await zipFile.async('blob');
          const fileExt = filename.split('.').pop() || 'jpg';
          const fileName = `exported-${Date.now()}-${imageFiles.length}.${fileExt}`;

          imageFiles.push(new File([fileBlob], fileName, {
            type: fileBlob.type || 'image/jpeg',
            lastModified: Date.now()
          }));
        }
      })
    );

    return imageFiles;
  };

  const convertImageToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const downloadFile = (file: File) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
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

        {exportedFiles.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <Text size="large">Exported Image Previews</Text>
            <Rows spacing="2u">
              {exportedFiles.map((file, index) => (
                <div key={index} style={{ 
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  padding: "12px",
                  backgroundColor: "#f9f9f9"
                }}>
                  <Text size="small" tone="tertiary">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </Text>
                  <div style={{ margin: "8px 0" }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "auto",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => downloadFile(file)}
                    variant="tertiary"
                    stretch
                  >
                    Download
                  </Button>
                </div>
              ))}
            </Rows>
          </div>
        )}
      </Rows>
    </div>
  );
};