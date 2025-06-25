import pdfMake from 'pdfmake/build/pdfmake';

export async function configurePdfFonts() {
  const caprasimoBase64 = await fetchText(
    '/assets/fonts/Caprasimo-Regular.txt'
  );
  const robotoRegularBase64 = await fetchText(
    '/assets/fonts/Roboto-Regular.txt'
  );
  const robotoMediumBase64 = await fetchText('/assets/fonts/Roboto-Medium.txt');
  const robotoBoldBase64 = await fetchText('/assets/fonts/Roboto-Bold.txt');
  const robotoItalicBase64 = await fetchText('/assets/fonts/Roboto-Italic.txt');

  pdfMake.vfs = {
    'Caprasimo-Regular.ttf': caprasimoBase64,
    'Roboto-Regular.ttf': robotoRegularBase64,
    'Roboto-Medium.ttf': robotoMediumBase64,
    'Roboto-Bold.ttf': robotoBoldBase64,
    'Roboto-Italic.ttf': robotoItalicBase64,
  };

  pdfMake.fonts = {
    Caprasimo: {
      normal: 'Caprasimo-Regular.ttf',
    },
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Bold.ttf',
      italics: 'Roboto-Italic.ttf',
    },
  };

  console.log('✅ Fuentes cargadas:', pdfMake.fonts);
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path);
  return await response.text();
}
