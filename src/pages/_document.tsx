import { Html, Head, Main, NextScript } from "next/document";
import Script from 'next/script'


export default function Document() {
  return (
    <Html lang="en">
      <Head>
      <meta name="image" content="/home.png" />
      <meta name="whatsapp:image" content="/home.png" />
      <Script src="https://kit.fontawesome.com/e822fa5c46.js" crossOrigin="anonymous"></Script>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0&display=optional" />
      <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap"
      rel="stylesheet"
    />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
