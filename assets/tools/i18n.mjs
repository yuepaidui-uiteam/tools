export const LANGS = [
  'en-US', 'es-ES', 'pt-BR', 'fr-FR', 'de-DE', 'nl-NL', 'ja-JP', 'ko-KR', 'zh-CN'
];

export const LANGUAGE_NAMES = {
  'en-US': 'English',
  'es-ES': 'Español',
  'pt-BR': 'Português (Brasil)',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'nl-NL': 'Nederlands',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'zh-CN': '简体中文'
};

const EN = {
  meta_title: 'Free Image Tools',
  meta_description: 'Free, local-first image tools that run entirely in your browser.',
  nav_tools: 'Free tools',
  nav_home: 'Home',
  nav_plugins: 'Plugins',
  nav_pricing: 'Pricing',
  footer_tools: 'Free tools',
  footer_privacy: 'Privacy',
  footer_terms: 'Terms',
  language: 'Language',
  tools_eyebrow: 'Free image tools',
  tools_title: 'Small image tasks, done locally.',
  tools_lead: 'Fast browser tools for everyday image work. Your files stay on this device.',
  tools_available: 'Available now',
  compress_title: 'Image Compressor',
  compress_description: 'Shrink JPG, PNG, and WebP files while keeping control of quality.',
  compress_action: 'Compress images',
  nine_patch_title: 'Nine-patch Editor',
  nine_patch_description: 'Create stretchable Android nine-patch PNGs with a visual editor.',
  nine_patch_action: 'Open nine-patch editor',
  local_title: 'Private by default',
  local_description: 'Files are processed in your browser and are not uploaded to a server.',
  files_count: '{count} files',
  file_count: '{count} file',
  choose_files: 'Choose files',
  choose_image: 'Choose image',
  drop_files: 'Drop images here',
  drop_png: 'Drop image here',
  upload_limits: 'Up to 30 images, 25 MB each. Supports JPG, PNG, and WebP.',
  local_choose_formats: 'or choose JPG, PNG, WebP from this device',
  local_choose_png: 'or choose PNG / .9.png from this device',
  remove: 'Remove',
  download: 'Download',
  download_all: 'Download all',
  clear_list: 'Clear list',
  start_compress: 'Start compression',
  recompress: 'Recompress',
  zip_download: 'Download ZIP',
  no_images_selected: 'No images selected',
  processing: 'Processing...',
  ready: 'Ready',
  error_generic: 'Something went wrong. Please try again.',
  settings: 'Settings',
  output_format: 'Output format',
  quality: 'Quality',
  quality_high: 'High quality (90%)',
  quality_balanced: 'Balanced (78%)',
  quality_small: 'Smaller file (62%)',
  quality_custom: 'Custom',
  custom_quality: 'Custom quality',
  resize: 'Resize',
  keep_original_size: 'Keep original size',
  resize_percent: 'Scale by percent',
  resize_width: 'Set width',
  resize_height: 'Set height',
  resize_value: 'Size value',
  jpg_background: 'JPG background',
  jpg_background_picker: 'Choose JPG background color',
  jpg_background_hex: 'JPG background hex value',
  image_queue: 'Your images',
  changed_reprocess: 'Settings changed. Reprocess to update output.',
  cancelled_reprocess: 'Cancelled. You can process again.',
  cannot_process_image: 'Could not process image.',
  retry: 'Retry',
  bytes: '{value} B',
  kilobytes: '{value} KB',
  megabytes: '{value} MB',
  gigabytes: '{value} GB',
  nine_meta_title: 'Nine-patch Editor',
  nine_meta_description: 'Create Android .9.png assets locally in your browser.',
  nine_title: '.9 image maker',
  nine_lead: 'Choose or drop a PNG, auto-create stretch regions, then drag the guide lines to adjust the nine-patch.',
  slice_region: 'Slice region',
  resource_name: 'Resource name',
  source_density: 'Source density',
  marker_mode: 'Marker mode',
  stretch_region: 'Stretch region',
  content_padding: 'Content padding',
  editor_label: '.9 image slice editor',
  auto_stretch: 'Recreate stretch region',
  background: 'Background',
  checker: 'Checker',
  light: 'Light',
  dark: 'Dark',
  preview: 'Preview',
  width: 'Width',
  height: 'Height',
  preview_label: 'Drag preview image to adjust width and height',
  nine_initial_status: 'Load an image first, then create a .9.png.',
  export_density: 'Export density',
  download_nine: 'Download .9.png'
};

function dictionary(overrides) {
  return { ...EN, ...overrides };
}

export const DICTS = {
  'en-US': EN,
  'es-ES': dictionary({
    nav_tools: 'Herramientas gratis', nav_home: 'Inicio', nav_plugins: 'Plugins', nav_pricing: 'Precios',
    footer_tools: 'Herramientas gratis', footer_privacy: 'Privacidad', footer_terms: 'Términos', language: 'Idioma',
    tools_eyebrow: 'Herramientas de imagen gratis', tools_title: 'Pequeñas tareas de imagen, hechas localmente.', tools_lead: 'Herramientas rápidas en el navegador para imágenes diarias. Tus archivos permanecen en este dispositivo.',
    tools_available: 'Disponible ahora', compress_title: 'Compresor de imágenes', compress_description: 'Reduce JPG, PNG y WebP conservando el control de calidad.', compress_action: 'Comprimir imágenes',
    nine_patch_title: 'Editor nine-patch', nine_patch_description: 'Crea PNG nine-patch de Android con un editor visual.', nine_patch_action: 'Abrir editor nine-patch',
    local_title: 'Privado por defecto', local_description: 'Los archivos se procesan en tu navegador y no se suben a un servidor.',
    files_count: '{count} archivos', file_count: '{count} archivo', choose_files: 'Elegir archivos', choose_image: 'Elegir imagen', drop_files: 'Arrastra imágenes aquí', drop_png: 'Arrastra la imagen aquí',
    upload_limits: 'Hasta 30 imágenes, 25 MB cada una. Compatible con JPG, PNG y WebP.', local_choose_formats: 'o elige JPG, PNG, WebP desde este dispositivo', local_choose_png: 'o elige PNG / .9.png desde este dispositivo',
    remove: 'Quitar', download: 'Descargar', download_all: 'Descargar todo', clear_list: 'Limpiar lista', start_compress: 'Iniciar compresión', recompress: 'Recomprimir', zip_download: 'Descargar ZIP', no_images_selected: 'No hay imágenes seleccionadas',
    processing: 'Procesando...', ready: 'Listo', error_generic: 'Algo salió mal. Inténtalo de nuevo.', settings: 'Ajustes', output_format: 'Formato de salida', quality: 'Calidad',
    quality_high: 'Alta calidad (90%)', quality_balanced: 'Equilibrado (78%)', quality_small: 'Archivo más pequeño (62%)', quality_custom: 'Personalizado', custom_quality: 'Calidad personalizada',
    resize: 'Redimensionar', keep_original_size: 'Mantener tamaño original', resize_percent: 'Escalar por porcentaje', resize_width: 'Definir ancho', resize_height: 'Definir alto', resize_value: 'Valor de tamaño',
    jpg_background: 'Fondo JPG', jpg_background_picker: 'Elegir color de fondo JPG', jpg_background_hex: 'Valor hexadecimal del fondo JPG', image_queue: 'Tus imágenes',
    changed_reprocess: 'Los ajustes cambiaron. Reprocesa para actualizar.', cancelled_reprocess: 'Cancelado. Puedes procesar de nuevo.', cannot_process_image: 'No se pudo procesar la imagen.', retry: 'Reintentar',
    nine_title: 'Creador de .9', nine_lead: 'Elige o arrastra un PNG, crea zonas de estiramiento automáticamente y ajusta las guías.', slice_region: 'Área de corte', resource_name: 'Nombre del recurso', source_density: 'Densidad origen',
    marker_mode: 'Modo de marca', stretch_region: 'Zona estirable', content_padding: 'Padding de contenido', auto_stretch: 'Recrear zona estirable', background: 'Fondo', checker: 'Cuadrícula', light: 'Claro', dark: 'Oscuro',
    preview: 'Vista previa', width: 'Ancho', height: 'Alto', nine_initial_status: 'Carga una imagen primero y luego crea el .9.png.', export_density: 'Densidad de exportación', download_nine: 'Descargar .9.png'
  }),
  'pt-BR': dictionary({
    nav_tools: 'Ferramentas grátis', nav_home: 'Início', nav_plugins: 'Plugins', nav_pricing: 'Preços',
    footer_tools: 'Ferramentas grátis', footer_privacy: 'Privacidade', footer_terms: 'Termos', language: 'Idioma',
    tools_eyebrow: 'Ferramentas de imagem grátis', tools_title: 'Pequenas tarefas de imagem, feitas localmente.', tools_lead: 'Ferramentas rápidas no navegador. Seus arquivos ficam neste dispositivo.',
    tools_available: 'Disponível agora', compress_title: 'Compressor de imagens', compress_description: 'Reduza JPG, PNG e WebP mantendo o controle da qualidade.', compress_action: 'Comprimir imagens',
    nine_patch_title: 'Editor nine-patch', nine_patch_description: 'Crie PNGs nine-patch Android com editor visual.', nine_patch_action: 'Abrir editor nine-patch',
    local_title: 'Privado por padrão', local_description: 'Os arquivos são processados no navegador e não são enviados a um servidor.',
    files_count: '{count} arquivos', file_count: '{count} arquivo', choose_files: 'Escolher arquivos', choose_image: 'Escolher imagem', drop_files: 'Solte imagens aqui', drop_png: 'Solte a imagem aqui',
    upload_limits: 'Até 30 imagens, 25 MB cada. Suporta JPG, PNG e WebP.', local_choose_formats: 'ou escolha JPG, PNG, WebP neste dispositivo', local_choose_png: 'ou escolha PNG / .9.png neste dispositivo',
    remove: 'Remover', download: 'Baixar', download_all: 'Baixar tudo', clear_list: 'Limpar lista', start_compress: 'Iniciar compressão', recompress: 'Recomprimir', zip_download: 'Baixar ZIP', no_images_selected: 'Nenhuma imagem selecionada',
    processing: 'Processando...', ready: 'Pronto', error_generic: 'Algo deu errado. Tente novamente.', settings: 'Configurações', output_format: 'Formato de saída', quality: 'Qualidade',
    quality_high: 'Alta qualidade (90%)', quality_balanced: 'Equilibrado (78%)', quality_small: 'Arquivo menor (62%)', quality_custom: 'Personalizado', custom_quality: 'Qualidade personalizada',
    resize: 'Redimensionar', keep_original_size: 'Manter tamanho original', resize_percent: 'Escalar por porcentagem', resize_width: 'Definir largura', resize_height: 'Definir altura', resize_value: 'Valor do tamanho',
    jpg_background: 'Fundo JPG', jpg_background_picker: 'Escolher cor de fundo JPG', jpg_background_hex: 'Valor hexadecimal do fundo JPG', image_queue: 'Suas imagens',
    changed_reprocess: 'Configurações alteradas. Reprocesse para atualizar.', cancelled_reprocess: 'Cancelado. Você pode processar novamente.', cannot_process_image: 'Não foi possível processar a imagem.', retry: 'Tentar novamente',
    nine_title: 'Criador de .9', nine_lead: 'Escolha ou solte um PNG, crie regiões esticáveis automaticamente e ajuste as guias.', slice_region: 'Área de corte', resource_name: 'Nome do recurso', source_density: 'Densidade origem',
    marker_mode: 'Modo de marca', stretch_region: 'Região esticável', content_padding: 'Padding do conteúdo', auto_stretch: 'Recriar região esticável', background: 'Fundo', checker: 'Xadrez', light: 'Claro', dark: 'Escuro',
    preview: 'Prévia', width: 'Largura', height: 'Altura', nine_initial_status: 'Carregue uma imagem primeiro e depois crie o .9.png.', export_density: 'Densidade de exportação', download_nine: 'Baixar .9.png'
  }),
  'fr-FR': dictionary({
    nav_tools: 'Outils gratuits', nav_home: 'Accueil', nav_plugins: 'Plugins', nav_pricing: 'Tarifs',
    footer_tools: 'Outils gratuits', footer_privacy: 'Confidentialité', footer_terms: 'Conditions', language: 'Langue',
    tools_eyebrow: 'Outils image gratuits', tools_title: 'Petites tâches image, traitées localement.', tools_lead: 'Des outils rapides dans le navigateur. Vos fichiers restent sur cet appareil.',
    tools_available: 'Disponible', compress_title: 'Compresseur d’images', compress_description: 'Réduisez les JPG, PNG et WebP en gardant le contrôle qualité.', compress_action: 'Compresser les images',
    nine_patch_title: 'Éditeur nine-patch', nine_patch_description: 'Créez des PNG Android nine-patch avec un éditeur visuel.', nine_patch_action: 'Ouvrir l’éditeur nine-patch',
    local_title: 'Privé par défaut', local_description: 'Les fichiers sont traités dans votre navigateur et ne sont pas envoyés sur un serveur.',
    files_count: '{count} fichiers', file_count: '{count} fichier', choose_files: 'Choisir des fichiers', choose_image: 'Choisir une image', drop_files: 'Déposez les images ici', drop_png: 'Déposez l’image ici',
    upload_limits: 'Jusqu’à 30 images, 25 Mo chacune. JPG, PNG et WebP.', local_choose_formats: 'ou choisissez JPG, PNG, WebP sur cet appareil', local_choose_png: 'ou choisissez PNG / .9.png sur cet appareil',
    remove: 'Retirer', download: 'Télécharger', download_all: 'Tout télécharger', clear_list: 'Vider la liste', start_compress: 'Compresser', recompress: 'Recompresser', zip_download: 'Télécharger ZIP', no_images_selected: 'Aucune image sélectionnée',
    processing: 'Traitement...', ready: 'Prêt', error_generic: 'Un problème est survenu. Réessayez.', settings: 'Réglages', output_format: 'Format de sortie', quality: 'Qualité',
    quality_high: 'Haute qualité (90%)', quality_balanced: 'Équilibré (78%)', quality_small: 'Fichier plus petit (62%)', quality_custom: 'Personnalisé', custom_quality: 'Qualité personnalisée',
    resize: 'Redimensionner', keep_original_size: 'Taille originale', resize_percent: 'Échelle en pourcentage', resize_width: 'Définir la largeur', resize_height: 'Définir la hauteur', resize_value: 'Valeur de taille',
    jpg_background: 'Fond JPG', jpg_background_picker: 'Choisir la couleur de fond JPG', jpg_background_hex: 'Valeur hexadécimale du fond JPG', image_queue: 'Vos images',
    changed_reprocess: 'Réglages modifiés. Recompressez pour mettre à jour.', cancelled_reprocess: 'Annulé. Vous pouvez relancer.', cannot_process_image: 'Impossible de traiter l’image.', retry: 'Réessayer',
    nine_title: 'Créateur .9', nine_lead: 'Choisissez ou déposez un PNG, créez les zones extensibles puis ajustez les guides.', slice_region: 'Zone de découpe', resource_name: 'Nom de ressource', source_density: 'Densité source',
    marker_mode: 'Mode de repère', stretch_region: 'Zone extensible', content_padding: 'Padding contenu', auto_stretch: 'Recréer la zone extensible', background: 'Fond', checker: 'Damier', light: 'Clair', dark: 'Sombre',
    preview: 'Aperçu', width: 'Largeur', height: 'Hauteur', nine_initial_status: 'Chargez une image avant de créer le .9.png.', export_density: 'Densité d’export', download_nine: 'Télécharger .9.png'
  }),
  'de-DE': dictionary({
    nav_tools: 'Kostenlose Tools', nav_home: 'Startseite', nav_plugins: 'Plugins', nav_pricing: 'Preise',
    footer_tools: 'Kostenlose Tools', footer_privacy: 'Datenschutz', footer_terms: 'Bedingungen', language: 'Sprache',
    tools_eyebrow: 'Kostenlose Bildtools', tools_title: 'Kleine Bildaufgaben, lokal erledigt.', tools_lead: 'Schnelle Browsertools für tägliche Bildarbeit. Ihre Dateien bleiben auf diesem Gerät.',
    tools_available: 'Jetzt verfügbar', compress_title: 'Bildkompressor', compress_description: 'Verkleinern Sie JPG, PNG und WebP mit voller Qualitätskontrolle.', compress_action: 'Bilder komprimieren',
    nine_patch_title: 'Nine-patch-Editor', nine_patch_description: 'Erstellen Sie Android-Nine-patch-PNGs mit einem visuellen Editor.', nine_patch_action: 'Nine-patch-Editor öffnen',
    local_title: 'Standardmäßig privat', local_description: 'Dateien werden im Browser verarbeitet und nicht auf einen Server hochgeladen.',
    files_count: '{count} Dateien', file_count: '{count} Datei', choose_files: 'Dateien auswählen', choose_image: 'Bild auswählen', drop_files: 'Bilder hier ablegen', drop_png: 'Bild hier ablegen',
    upload_limits: 'Bis zu 30 Bilder, je 25 MB. Unterstützt JPG, PNG und WebP.', local_choose_formats: 'oder JPG, PNG, WebP von diesem Gerät wählen', local_choose_png: 'oder PNG / .9.png von diesem Gerät wählen',
    remove: 'Entfernen', download: 'Herunterladen', download_all: 'Alle herunterladen', clear_list: 'Liste leeren', start_compress: 'Komprimieren', recompress: 'Neu komprimieren', zip_download: 'ZIP herunterladen', no_images_selected: 'Keine Bilder ausgewählt',
    processing: 'Verarbeitung...', ready: 'Bereit', error_generic: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.', settings: 'Einstellungen', output_format: 'Ausgabeformat', quality: 'Qualität',
    quality_high: 'Hohe Qualität (90%)', quality_balanced: 'Ausgewogen (78%)', quality_small: 'Kleinere Datei (62%)', quality_custom: 'Benutzerdefiniert', custom_quality: 'Benutzerdefinierte Qualität',
    resize: 'Größe ändern', keep_original_size: 'Originalgröße behalten', resize_percent: 'Nach Prozent skalieren', resize_width: 'Breite festlegen', resize_height: 'Höhe festlegen', resize_value: 'Größenwert',
    jpg_background: 'JPG-Hintergrund', jpg_background_picker: 'JPG-Hintergrundfarbe wählen', jpg_background_hex: 'JPG-Hintergrund als Hexwert', image_queue: 'Ihre Bilder',
    changed_reprocess: 'Einstellungen geändert. Bitte neu verarbeiten.', cancelled_reprocess: 'Abgebrochen. Sie können erneut verarbeiten.', cannot_process_image: 'Bild konnte nicht verarbeitet werden.', retry: 'Erneut versuchen',
    nine_title: '.9-Bild erstellen', nine_lead: 'PNG auswählen oder ablegen, Streckbereiche automatisch erstellen und Hilfslinien ziehen.', slice_region: 'Slice-Bereich', resource_name: 'Ressourcenname', source_density: 'Quelldichte',
    marker_mode: 'Markierungsmodus', stretch_region: 'Streckbereich', content_padding: 'Inhalts-padding', auto_stretch: 'Streckbereich neu erstellen', background: 'Hintergrund', checker: 'Schachbrett', light: 'Hell', dark: 'Dunkel',
    preview: 'Vorschau', width: 'Breite', height: 'Höhe', nine_initial_status: 'Laden Sie zuerst ein Bild, dann erstellen Sie die .9.png.', export_density: 'Exportdichte', download_nine: '.9.png herunterladen'
  }),
  'nl-NL': dictionary({
    nav_tools: 'Gratis tools', nav_home: 'Home', nav_plugins: 'Plugins', nav_pricing: 'Prijzen',
    footer_tools: 'Gratis tools', footer_privacy: 'Privacy', footer_terms: 'Voorwaarden', language: 'Taal',
    tools_eyebrow: 'Gratis afbeeldingshulpmiddelen', tools_title: 'Kleine beeldtaken, lokaal gedaan.', tools_lead: 'Snelle browsertools voor dagelijks beeldwerk. Je bestanden blijven op dit apparaat.',
    tools_available: 'Nu beschikbaar', compress_title: 'Afbeeldingscompressor', compress_description: 'Verklein JPG, PNG en WebP met behoud van kwaliteitscontrole.', compress_action: 'Afbeeldingen comprimeren',
    nine_patch_title: 'Nine-patch-editor', nine_patch_description: 'Maak Android nine-patch-PNGs met een visuele editor.', nine_patch_action: 'Nine-patch-editor openen',
    local_title: 'Standaard privé', local_description: 'Bestanden worden in je browser verwerkt en niet naar een server geüpload.',
    files_count: '{count} bestanden', file_count: '{count} bestand', choose_files: 'Bestanden kiezen', choose_image: 'Afbeelding kiezen', drop_files: 'Sleep afbeeldingen hierheen', drop_png: 'Sleep de afbeelding hierheen',
    upload_limits: 'Maximaal 30 afbeeldingen, 25 MB per stuk. JPG, PNG en WebP.', local_choose_formats: 'of kies JPG, PNG, WebP op dit apparaat', local_choose_png: 'of kies PNG / .9.png op dit apparaat',
    remove: 'Verwijderen', download: 'Downloaden', download_all: 'Alles downloaden', clear_list: 'Lijst wissen', start_compress: 'Comprimeren', recompress: 'Opnieuw comprimeren', zip_download: 'ZIP downloaden', no_images_selected: 'Geen afbeeldingen geselecteerd',
    processing: 'Verwerken...', ready: 'Gereed', error_generic: 'Er is iets misgegaan. Probeer het opnieuw.', settings: 'Instellingen', output_format: 'Uitvoerformaat', quality: 'Kwaliteit',
    quality_high: 'Hoge kwaliteit (90%)', quality_balanced: 'Gebalanceerd (78%)', quality_small: 'Kleiner bestand (62%)', quality_custom: 'Aangepast', custom_quality: 'Aangepaste kwaliteit',
    resize: 'Formaat wijzigen', keep_original_size: 'Originele grootte behouden', resize_percent: 'Schalen op percentage', resize_width: 'Breedte instellen', resize_height: 'Hoogte instellen', resize_value: 'Groottewaarde',
    jpg_background: 'JPG-achtergrond', jpg_background_picker: 'JPG-achtergrondkleur kiezen', jpg_background_hex: 'Hexwaarde JPG-achtergrond', image_queue: 'Je afbeeldingen',
    changed_reprocess: 'Instellingen gewijzigd. Verwerk opnieuw.', cancelled_reprocess: 'Geannuleerd. Je kunt opnieuw verwerken.', cannot_process_image: 'Afbeelding kon niet worden verwerkt.', retry: 'Opnieuw proberen',
    nine_title: '.9-maker', nine_lead: 'Kies of sleep een PNG, maak automatisch rekzones en pas de hulplijnen aan.', slice_region: 'Slicegebied', resource_name: 'Resourcenaam', source_density: 'Brondichtheid',
    marker_mode: 'Markeringsmodus', stretch_region: 'Rekgebied', content_padding: 'Content padding', auto_stretch: 'Rekgebied opnieuw maken', background: 'Achtergrond', checker: 'Ruitjes', light: 'Licht', dark: 'Donker',
    preview: 'Voorbeeld', width: 'Breedte', height: 'Hoogte', nine_initial_status: 'Laad eerst een afbeelding en maak daarna de .9.png.', export_density: 'Exportdichtheid', download_nine: '.9.png downloaden'
  }),
  'ja-JP': dictionary({
    nav_tools: '無料ツール', nav_home: 'ホーム', nav_plugins: 'プラグイン', nav_pricing: '料金',
    footer_tools: '無料ツール', footer_privacy: 'プライバシー', footer_terms: '利用規約', language: '言語',
    tools_eyebrow: '無料画像ツール', tools_title: '小さな画像作業をローカルで完了。', tools_lead: '日々の画像作業に使える高速ブラウザツール。ファイルはこの端末に残ります。',
    tools_available: '利用可能', compress_title: '画像圧縮', compress_description: 'JPG、PNG、WebP を画質を調整しながら軽量化します。', compress_action: '画像を圧縮',
    nine_patch_title: 'Nine-patch エディタ', nine_patch_description: 'Android の nine-patch PNG を視覚的に作成します。', nine_patch_action: 'Nine-patch を開く',
    local_title: '最初からプライベート', local_description: 'ファイルはブラウザ内で処理され、サーバーへアップロードされません。',
    files_count: '{count} ファイル', file_count: '{count} ファイル', choose_files: 'ファイルを選択', choose_image: '画像を選択', drop_files: '画像をここにドロップ', drop_png: '画像をここにドロップ',
    upload_limits: '最大 30 枚、各 25 MB。JPG、PNG、WebP 対応。', local_choose_formats: 'またはこの端末から JPG、PNG、WebP を選択', local_choose_png: 'またはこの端末から PNG / .9.png を選択',
    remove: '削除', download: 'ダウンロード', download_all: 'すべてダウンロード', clear_list: 'リストをクリア', start_compress: '圧縮開始', recompress: '再圧縮', zip_download: 'ZIP をダウンロード', no_images_selected: '画像が選択されていません',
    processing: '処理中...', ready: '準備完了', error_generic: '問題が発生しました。もう一度お試しください。', settings: '設定', output_format: '出力形式', quality: '品質',
    quality_high: '高品質 (90%)', quality_balanced: 'バランス (78%)', quality_small: '小さいファイル (62%)', quality_custom: 'カスタム', custom_quality: 'カスタム品質',
    resize: 'サイズ変更', keep_original_size: '元のサイズを保持', resize_percent: '割合で拡大縮小', resize_width: '幅を指定', resize_height: '高さを指定', resize_value: 'サイズ値',
    jpg_background: 'JPG 背景', jpg_background_picker: 'JPG 背景色を選択', jpg_background_hex: 'JPG 背景色の HEX 値', image_queue: '画像一覧',
    changed_reprocess: '設定が変更されました。再処理してください。', cancelled_reprocess: 'キャンセルしました。再処理できます。', cannot_process_image: '画像を処理できません。', retry: '再試行',
    nine_title: '.9 画像作成ツール', nine_lead: 'PNG を選択またはドロップし、伸縮範囲を自動作成してガイドを調整します。', slice_region: '切片区域', resource_name: 'リソース名', source_density: '元画像密度',
    marker_mode: 'マーカーモード', stretch_region: '伸縮範囲', content_padding: 'コンテンツ padding', auto_stretch: '伸縮範囲を再作成', background: '背景', checker: '市松模様', light: 'ライト', dark: 'ダーク',
    preview: 'プレビュー', width: '幅', height: '高さ', nine_initial_status: '先に画像を読み込んでから .9.png を作成してください。', export_density: '書き出し密度', download_nine: '.9.png をダウンロード'
  }),
  'ko-KR': dictionary({
    nav_tools: '무료 도구', nav_home: '홈', nav_plugins: '플러그인', nav_pricing: '가격',
    footer_tools: '무료 도구', footer_privacy: '개인정보', footer_terms: '약관', language: '언어',
    tools_eyebrow: '무료 이미지 도구', tools_title: '작은 이미지 작업을 로컬에서 끝내세요.', tools_lead: '일상 이미지 작업을 위한 빠른 브라우저 도구입니다. 파일은 이 기기에 남습니다.',
    tools_available: '사용 가능', compress_title: '이미지 압축', compress_description: 'JPG, PNG, WebP를 품질을 조절하며 줄입니다.', compress_action: '이미지 압축',
    nine_patch_title: 'Nine-patch 편집기', nine_patch_description: '시각 편집기로 Android nine-patch PNG를 만듭니다.', nine_patch_action: 'Nine-patch 편집기 열기',
    local_title: '기본적으로 비공개', local_description: '파일은 브라우저에서 처리되며 서버로 업로드되지 않습니다.',
    files_count: '파일 {count}개', file_count: '파일 {count}개', choose_files: '파일 선택', choose_image: '이미지 선택', drop_files: '이미지를 여기에 놓기', drop_png: '이미지를 여기에 놓기',
    upload_limits: '최대 30장, 각 25 MB. JPG, PNG, WebP 지원.', local_choose_formats: '또는 이 기기에서 JPG, PNG, WebP 선택', local_choose_png: '또는 이 기기에서 PNG / .9.png 선택',
    remove: '제거', download: '다운로드', download_all: '모두 다운로드', clear_list: '목록 지우기', start_compress: '압축 시작', recompress: '다시 압축', zip_download: 'ZIP 다운로드', no_images_selected: '선택된 이미지 없음',
    processing: '처리 중...', ready: '준비됨', error_generic: '문제가 발생했습니다. 다시 시도하세요.', settings: '설정', output_format: '출력 형식', quality: '품질',
    quality_high: '고품질 (90%)', quality_balanced: '균형 (78%)', quality_small: '더 작은 파일 (62%)', quality_custom: '사용자 지정', custom_quality: '사용자 지정 품질',
    resize: '크기 조정', keep_original_size: '원본 크기 유지', resize_percent: '비율로 조정', resize_width: '너비 지정', resize_height: '높이 지정', resize_value: '크기 값',
    jpg_background: 'JPG 배경', jpg_background_picker: 'JPG 배경색 선택', jpg_background_hex: 'JPG 배경 HEX 값', image_queue: '이미지 목록',
    changed_reprocess: '설정이 변경되었습니다. 다시 처리하세요.', cancelled_reprocess: '취소되었습니다. 다시 처리할 수 있습니다.', cannot_process_image: '이미지를 처리할 수 없습니다.', retry: '재시도',
    nine_title: '.9 이미지 만들기', nine_lead: 'PNG를 선택하거나 놓고, 늘어나는 영역을 자동 생성한 뒤 가이드를 조정하세요.', slice_region: '슬라이스 영역', resource_name: '리소스 이름', source_density: '원본 밀도',
    marker_mode: '마커 모드', stretch_region: '늘어나는 영역', content_padding: '콘텐츠 padding', auto_stretch: '늘어나는 영역 다시 만들기', background: '배경', checker: '체커', light: '밝게', dark: '어둡게',
    preview: '미리보기', width: '너비', height: '높이', nine_initial_status: '먼저 이미지를 불러온 뒤 .9.png를 만드세요.', export_density: '내보내기 밀도', download_nine: '.9.png 다운로드'
  }),
  'zh-CN': dictionary({
    meta_title: '免费图片工具', meta_description: '免费的本地优先图片工具，完全在浏览器中运行。',
    nav_tools: '免费工具', nav_home: '首页', nav_plugins: '插件', nav_pricing: '价格',
    footer_tools: '免费工具', footer_privacy: '隐私', footer_terms: '条款', language: '语言',
    tools_eyebrow: '免费图片工具', tools_title: '小小图片任务，本地就能完成。', tools_lead: '为日常图片处理打造的快速浏览器工具。文件始终留在这台设备上。',
    tools_available: '现已可用', compress_title: '图片批量压缩与格式转换', compress_description: '压缩 JPG、PNG 和 WebP 文件，同时保留画质控制。', compress_action: '压缩图片',
    nine_patch_title: '.9 图制作工具', nine_patch_description: '通过可视化编辑器创建可拉伸的 Android nine-patch PNG。', nine_patch_action: '制作 .9 图',
    local_title: '默认保护隐私', local_description: '文件只在浏览器中处理，不会上传至服务器。',
    files_count: '{count} 个文件', file_count: '{count} 个文件', choose_files: '选择文件', choose_image: '选择图片', drop_files: '拖入图片到这里', drop_png: '拖入图片到这里',
    upload_limits: '一次最多 30 张，每张不超过 25 MB，支持 JPG、PNG 和 WebP。', local_choose_formats: '或从本机选择 JPG、PNG、WebP', local_choose_png: '或从本机选择 PNG / .9.png',
    remove: '移除', download: '下载', download_all: '全部下载', clear_list: '清除列表', start_compress: '开始压缩', recompress: '重新压缩', zip_download: '打包下载', no_images_selected: '尚未选择图片',
    processing: '处理中...', ready: '已完成', error_generic: '出现问题，请重试。', settings: '设置', output_format: '输出格式', quality: '压缩质量',
    quality_high: '高清（90%）', quality_balanced: '均衡（78%）', quality_small: '更小文件（62%）', quality_custom: '自定义', custom_quality: '自定义质量',
    resize: '调整尺寸', keep_original_size: '保持原始尺寸', resize_percent: '按百分比缩放', resize_width: '指定宽度', resize_height: '指定高度', resize_value: '尺寸数值',
    jpg_background: 'JPG 背景色', jpg_background_picker: '选择 JPG 背景色', jpg_background_hex: 'JPG 背景色值', image_queue: '待处理图片',
    changed_reprocess: '设置已更改，请重新处理', cancelled_reprocess: '已取消，可以重新处理', cannot_process_image: '无法处理图片', retry: '重试',
    nine_meta_title: '.9 图制作工具', nine_meta_description: '在浏览器本地制作 Android .9 图，图片不会上传。',
    nine_title: '.9 图制作工具', nine_lead: '选择或拖入 PNG，自动创建拉伸区；拖动虚线就能调整切片，图片只在本地浏览器处理。',
    slice_region: '切片区域', resource_name: '资源名称', source_density: '源图密度', marker_mode: '标记模式', stretch_region: '拉伸区', content_padding: '内容 padding',
    editor_label: '.9 图切片编辑器', auto_stretch: '重新自动创建拉伸区', background: '背景', checker: '棋盘格', light: '浅色', dark: '深色',
    preview: '预览', width: '宽度', height: '高度', preview_label: '拖动预览图调整宽高', nine_initial_status: '先加载图片，再制作 .9 图。', export_density: '导出倍数', download_nine: '下载 .9.png'
  })
};

const DEFAULT_LANG = 'en-US';
const STORAGE_KEY = 'imageToolsLang';

function getBrowserLanguages() {
  const nav = globalThis.navigator;
  if (!nav) return [];
  if (Array.isArray(nav.languages) && nav.languages.length) return nav.languages;
  return nav.language ? [nav.language] : [];
}

export function supportedLanguage(value) {
  if (!value) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  const exact = LANGS.find((lang) => lang.toLowerCase() === normalized.toLowerCase());
  if (exact) return exact;
  const base = normalized.toLowerCase().split('-')[0];
  if (base === 'zh') return 'zh-CN';
  if (base === 'pt') return 'pt-BR';
  return LANGS.find((lang) => lang.toLowerCase().split('-')[0] === base) || null;
}

export function resolveLanguage(saved, browserLanguages = getBrowserLanguages()) {
  const savedLang = supportedLanguage(saved);
  if (savedLang) return savedLang;
  for (const lang of browserLanguages || []) {
    const match = supportedLanguage(lang);
    if (match) return match;
  }
  return DEFAULT_LANG;
}

export function detectLanguage() {
  let saved = null;
  try { saved = globalThis.localStorage?.getItem(STORAGE_KEY) || null; } catch (_) {}
  return resolveLanguage(saved);
}

function mergeDictionaries(extra = {}) {
  const merged = {};
  for (const lang of LANGS) merged[lang] = { ...(DICTS[lang] || EN), ...(extra[lang] || {}) };
  return merged;
}

export function t(lang, key, params = {}, dictionaries = DICTS) {
  const selected = supportedLanguage(lang) || DEFAULT_LANG;
  const dict = dictionaries[selected] || dictionaries[DEFAULT_LANG] || EN;
  const fallback = dictionaries[DEFAULT_LANG] || EN;
  const value = dict[key] ?? fallback[key] ?? EN[key] ?? key;
  return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
}

function setAttr(node, attr, value) {
  if (value != null) node.setAttribute(attr, value);
}

export function applyLanguage(lang, pageDictionaries = {}) {
  const selected = supportedLanguage(lang) || DEFAULT_LANG;
  const dictionaries = mergeDictionaries(pageDictionaries);
  try { globalThis.localStorage?.setItem(STORAGE_KEY, selected); } catch (_) {}
  if (!globalThis.document) return selected;

  document.documentElement.lang = selected;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(selected, node.dataset.i18n, {}, dictionaries);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((node) => {
    node.innerHTML = t(selected, node.dataset.i18nHtml, {}, dictionaries);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    setAttr(node, 'aria-label', t(selected, node.dataset.i18nAriaLabel, {}, dictionaries));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    setAttr(node, 'title', t(selected, node.dataset.i18nTitle, {}, dictionaries));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    setAttr(node, 'placeholder', t(selected, node.dataset.i18nPlaceholder, {}, dictionaries));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((node) => {
    setAttr(node, 'alt', t(selected, node.dataset.i18nAlt, {}, dictionaries));
  });

  const title = t(selected, 'meta_title', {}, dictionaries);
  if (title && title !== 'meta_title') document.title = title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) setAttr(metaDescription, 'content', t(selected, 'meta_description', {}, dictionaries));

  const select = document.querySelector('[data-language-select]');
  if (select) select.value = selected;
  document.dispatchEvent(new CustomEvent('image-tools:languagechange', { detail: { lang: selected } }));
  return selected;
}

export function formatBytes(bytes, lang = DEFAULT_LANG) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return t(lang, 'bytes', { value: 0 });
  const units = ['bytes', 'kilobytes', 'megabytes', 'gigabytes'];
  const index = Math.min(Math.floor(value ? Math.log(value) / Math.log(1024) : 0), units.length - 1);
  const amount = index === 0 ? value : Math.round((value / 1024 ** index) * 10) / 10;
  return t(lang, units[index], { value: amount });
}
