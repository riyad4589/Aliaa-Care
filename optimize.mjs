import sharp from 'sharp';

async function run() {
    console.log("Optimizing desktop image...");
    await sharp('src/assets/coffret-aliaa.jpeg')
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile('src/assets/coffret-aliaa.webp');

    console.log("Optimizing mobile image...");
    await sharp('src/assets/coffret-aliaa-phone.jpeg.png')
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile('src/assets/coffret-aliaa-phone.webp');

    console.log("Done");
}
run();
