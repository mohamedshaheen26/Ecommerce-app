export const convertToWebP = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(bitmap, 0, 0);

  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(new File([blob!], "image.webp", { type: "image/webp" }));
      },
      "image/webp",
      0.8,
    );
  });
};
