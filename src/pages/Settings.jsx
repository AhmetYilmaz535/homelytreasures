import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider as MuiSlider,
  TextField,
  LinearProgress
} from '@mui/material';
import {
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  getAllAvailableImages,
  getSelectedImages,
  saveSelectedImages,
  addCustomImage,
  updateImageOrder,
  getSliderSettings,
  updateSliderSettings,
  deleteImage
} from '../utils/imageStore';

const SettingsSection = ({ title, children }) => (
  <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {children}
  </Paper>
);

const Settings = () => {
  const fileInputRef = useRef(null);
  const [allImages, setAllImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    image: null
  });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Verileri yükle
        const [images, sliderSettings] = await Promise.all([
          getAllAvailableImages(),
          getSliderSettings()
        ]);

        // Resimleri ayarla
        setAllImages(images.filter(img => img.id !== '_init'));
        
        // Seçili resimleri ayarla
        const selectedImgs = sliderSettings.images || [];
        setSelectedImages(selectedImgs);
        
        // Ayarları ayarla
        const { images: _, ...settingsWithoutImages } = sliderSettings;
        setSettings(settingsWithoutImages);
      } catch (error) {
        console.error('Error loading data:', error);
        showMessage('Veriler yüklenirken bir hata oluştu: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleSettingsChange = () => {
      loadData();
    };

    const handleUploadProgress = (event) => {
      setUploadProgress(event.detail);
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    window.addEventListener('uploadProgress', handleUploadProgress);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
      window.removeEventListener('uploadProgress', handleUploadProgress);
    };
  }, []);

  const handleImageToggle = async (image) => {
    try {
      let newSelection;
      if (selectedImages.find(img => img.id === image.id)) {
        if (selectedImages.length > 1) {
          newSelection = selectedImages.filter(img => img.id !== image.id);
        } else {
          showMessage('En az bir resim seçili olmalıdır!', 'error');
          return;
        }
      } else {
        newSelection = [...selectedImages, image];
      }
      
      await saveSelectedImages(newSelection);
      setSelectedImages(newSelection);
      showMessage('Değişiklikler kaydedildi!');
    } catch (error) {
      console.error('Error toggling image:', error);
      showMessage('Değişiklikler kaydedilirken bir hata oluştu!', 'error');
    }
  };

  const moveImage = async (index, direction) => {
    try {
      const items = Array.from(allImages);
      if (direction === 'up' && index > 0) {
        [items[index], items[index - 1]] = [items[index - 1], items[index]];
      } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      const updatedImages = await updateImageOrder(items);
      setAllImages(updatedImages);
      showMessage('Sıralama güncellendi!');
    } catch (error) {
      console.error('Error moving image:', error);
      showMessage('Sıralama güncellenirken bir hata oluştu!', 'error');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showMessage('Lütfen geçerli bir resim dosyası seçin!', 'error');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      showMessage('Resim boyutu 5MB\'dan büyük olamaz!', 'error');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Mevcut resim sayısını kontrol et
      const currentImages = await getAllAvailableImages();
      if (currentImages.length >= 10) {
        throw new Error('Maksimum 10 resim yükleyebilirsiniz!');
      }

      // Resmi yükle
      const newImage = await addCustomImage(file);
      
      // Resim listesini güncelle
      const updatedImages = await getAllAvailableImages();
      setAllImages(updatedImages);
      
      // Başarı mesajı göster
      showMessage('Resim başarıyla yüklendi!');
      
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage(error.message || 'Resim yüklenirken bir hata oluştu!', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSettingChange = async (section, subsection, key, value) => {
    try {
      console.log('Updating settings:', { section, subsection, key, value });
      const newSettings = { ...settings };

      // Font boyutu değerlerini sayıya çevir
      if (key === 'fontSize') {
        value = parseInt(value);
      }
      
      // Nested yapıyı doğru şekilde güncelle
      if (section === 'effects') {
        if (!newSettings.effects) {
          newSettings.effects = {};
        }
        if (subsection) {
          if (!newSettings.effects[subsection]) {
            newSettings.effects[subsection] = {};
          }
          newSettings.effects[subsection][key] = value;
        } else {
          newSettings.effects[key] = value;
        }
      } else if (section === 'texts') {
        if (!newSettings.texts) {
          newSettings.texts = {};
        }
        if (subsection) {
          if (!newSettings.texts[subsection]) {
            newSettings.texts[subsection] = {};
          }
          newSettings.texts[subsection][key] = value;
        } else {
          newSettings.texts[key] = value;
        }
      } else if (section === 'footer') {
        if (!newSettings.footer) {
          newSettings.footer = {};
        }
        if (subsection) {
          if (!newSettings.footer[subsection]) {
            newSettings.footer[subsection] = {};
          }
          if (subsection === 'socialMedia' && key.includes('.')) {
            const [platform, field] = key.split('.');
            if (!newSettings.footer.socialMedia[platform]) {
              newSettings.footer.socialMedia[platform] = {};
            }
            newSettings.footer.socialMedia[platform][field] = value;
          } else {
            newSettings.footer[subsection][key] = value;
          }
        } else {
          newSettings.footer[key] = value;
        }
      }
      
      console.log('New settings:', newSettings);
      setSettings(newSettings);
      
      const result = await updateSliderSettings(newSettings);
      console.log('Update result:', result);
      
      showMessage('Ayarlar güncellendi!');
    } catch (error) {
      console.error('Error updating settings:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      showMessage('Ayarlar güncellenirken bir hata oluştu: ' + error.message, 'error');
    }
  };

  const handleImageDelete = async (image) => {
    if (window.confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      try {
        const success = await deleteImage(image.id);
        if (success) {
          const [images, selected] = await Promise.all([
            getAllAvailableImages(),
            getSelectedImages()
          ]);
          setAllImages(images);
          setSelectedImages(selected);
          showMessage('Resim başarıyla silindi!');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        showMessage('Resim silinirken bir hata oluştu!', 'error');
      }
    }
  };

  if (!settings) return null;

  return (
    <Box>
      <SettingsSection title="Slider Resimleri">
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => fileInputRef.current.click()}
              disabled={loading || allImages.length >= 10}
            >
              {loading ? 'Yükleniyor...' : 'Yeni Resim Yükle'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {allImages.length}/10 resim
            </Typography>
          </Box>
          {loading && uploadProgress > 0 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" align="center">
                %{Math.round(uploadProgress)}
              </Typography>
            </Box>
          )}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
          />
        </Box>

        {allImages.length === 0 && !loading && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            Henüz hiç resim yüklenmemiş. Yeni resim eklemek için yukarıdaki butonu kullanın.
          </Typography>
        )}

        <Grid container spacing={2}>
          {allImages.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={image.path}
                  alt={`Image ${image.id}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Sıra: {index + 1}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === allImages.length - 1}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleImageDelete(image)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedImages.some(img => img.id === image.id)}
                        onChange={() => handleImageToggle(image)}
                        color="primary"
                      />
                    }
                    label="Aktif"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </SettingsSection>

      <SettingsSection title="Ken Burns Efekti">
        <FormControlLabel
          control={
            <Switch
              checked={settings.effects.kenBurns.enabled}
              onChange={(e) => handleSettingChange('kenBurns', null, 'enabled', e.target.checked)}
            />
          }
          label="Ken Burns Efektini Etkinleştir"
        />
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Efekt Süresi (saniye)</Typography>
          <MuiSlider
            value={settings.effects.kenBurns.duration}
            onChange={(e, value) => handleSettingChange('kenBurns', null, 'duration', value)}
            min={5}
            max={30}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Zoom Aralığı (%)</Typography>
          <MuiSlider
            value={[
              settings.effects.kenBurns.zoomRange.min * 100,
              settings.effects.kenBurns.zoomRange.max * 100
            ]}
            onChange={(e, value) => {
              const newSettings = { ...settings };
              newSettings.effects.kenBurns.zoomRange = {
                min: value[0] / 100,
                max: value[1] / 100
              };
              setSettings(newSettings);
              updateSliderSettings(newSettings);
              showMessage('Ayarlar güncellendi!');
            }}
            min={100}
            max={150}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </SettingsSection>

      <SettingsSection title="Geçiş Efektleri">
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Geçiş Süresi (saniye)</Typography>
          <MuiSlider
            value={settings.effects.transition.duration}
            onChange={(e, value) => handleSettingChange('transition', null, 'duration', value)}
            min={0.5}
            max={3}
            step={0.1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Bulanıklık Miktarı (px)</Typography>
          <MuiSlider
            value={settings.effects.transition.blurAmount}
            onChange={(e, value) => handleSettingChange('transition', null, 'blurAmount', value)}
            min={0}
            max={20}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Karartma Opaklığı</Typography>
          <MuiSlider
            value={settings.effects.transition.darkOverlay}
            onChange={(e, value) => handleSettingChange('transition', null, 'darkOverlay', value)}
            min={0}
            max={1}
            step={0.1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </SettingsSection>

      <SettingsSection title="Film Grain Efekti">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.effects.filmGrain.enabled}
                  onChange={(e) => handleSettingChange('filmGrain', null, 'enabled', e.target.checked)}
                />
              }
              label="Film Grain Efekti"
            />
          </Grid>
          {settings.effects.filmGrain.enabled && (
            <>
              <Grid item xs={12}>
                <Typography gutterBottom>Opaklık</Typography>
                <MuiSlider
                  value={settings.effects.filmGrain.opacity}
                  onChange={(e, value) => handleSettingChange('filmGrain', null, 'opacity', value)}
                  min={0}
                  max={0.2}
                  step={0.01}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Animasyon Hızı</Typography>
                <MuiSlider
                  value={settings.effects.filmGrain.animationSpeed}
                  onChange={(e, value) => handleSettingChange('filmGrain', null, 'animationSpeed', value)}
                  min={1}
                  max={20}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                />
              </Grid>
            </>
          )}
        </Grid>
      </SettingsSection>

      <SettingsSection title="Metin Ayarları">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bu ayarlar sayfa başlığı ve alt başlığının görünümünü düzenler. Slider üzerindeki metinleri değil, sayfanın en üstündeki başlıkları özelleştirir.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Üst Menü Başlığı</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Metin"
                  value={settings.texts?.header?.text || ''}
                  onChange={(e) => handleSettingChange('texts', 'header', 'text', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Rengi"
                  type="color"
                  value={settings.texts?.header?.color || '#A67C52'}
                  onChange={(e) => {
                    const color = e.target.value;
                    handleSettingChange('texts', 'header', 'color', color);
                  }}
                  sx={{ 
                    '& input': { 
                      height: 40, 
                      cursor: 'pointer',
                      padding: '4px 8px'
                    },
                    '& .MuiOutlinedInput-root': {
                      padding: '8px'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          backgroundColor: settings.texts?.header?.color || '#A67C52',
                          marginRight: 1
                        }}
                      />
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Boyutu"
                  type="number"
                  value={settings.texts?.header?.fontSize || 20}
                  onChange={(e) => handleSettingChange('texts', 'header', 'fontSize', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 12, max: 48 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Kalınlığı"
                  type="number"
                  value={settings.texts?.header?.fontWeight || 700}
                  onChange={(e) => handleSettingChange('texts', 'header', 'fontWeight', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 100, max: 900, step: 100 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Ana Başlık</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Metin"
                  value={settings.texts?.heading?.text || ''}
                  onChange={(e) => handleSettingChange('texts', 'heading', 'text', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Rengi"
                  type="color"
                  value={settings.texts?.heading?.color || '#ffffff'}
                  onChange={(e) => handleSettingChange('texts', 'heading', 'color', e.target.value)}
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Boyutu"
                  type="number"
                  value={settings.texts?.heading?.fontSize || 48}
                  onChange={(e) => handleSettingChange('texts', 'heading', 'fontSize', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 12, max: 96 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Kalınlığı"
                  type="number"
                  value={settings.texts?.heading?.fontWeight || 600}
                  onChange={(e) => handleSettingChange('texts', 'heading', 'fontWeight', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 100, max: 900, step: 100 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Alt Başlık</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Metin"
                  value={settings.texts?.subheading?.text || ''}
                  onChange={(e) => handleSettingChange('texts', 'subheading', 'text', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Rengi"
                  type="color"
                  value={settings.texts?.subheading?.color || '#ffffff'}
                  onChange={(e) => handleSettingChange('texts', 'subheading', 'color', e.target.value)}
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Boyutu"
                  type="number"
                  value={settings.texts?.subheading?.fontSize || 24}
                  onChange={(e) => handleSettingChange('texts', 'subheading', 'fontSize', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 12, max: 72 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Kalınlığı"
                  type="number"
                  value={settings.texts?.subheading?.fontWeight || 400}
                  onChange={(e) => handleSettingChange('texts', 'subheading', 'fontWeight', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 100, max: 900, step: 100 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>About Bölümü</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Başlık"
                  value={settings.texts?.about?.title || 'About'}
                  onChange={(e) => handleSettingChange('texts', 'about', 'title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Metin (HTML formatında düzenleyebilirsiniz)
                </Typography>
                <ReactQuill
                  value={settings.texts?.about?.text || ''}
                  onChange={(value) => handleSettingChange('texts', 'about', 'text', value)}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean'],
                      [{ 'color': [] }, { 'background': [] }],
                      ['blockquote', 'code-block'],
                      [{ 'align': [] }]
                    ]
                  }}
                  style={{ height: '200px', marginBottom: '50px' }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Başlık Rengi"
                  type="color"
                  value={settings.texts?.about?.titleColor || '#A67C52'}
                  onChange={(e) => handleSettingChange('texts', 'about', 'titleColor', e.target.value)}
                  sx={{ 
                    '& input': { 
                      height: 40, 
                      cursor: 'pointer',
                      padding: '4px 8px'
                    },
                    '& .MuiOutlinedInput-root': {
                      padding: '8px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Metin Rengi"
                  type="color"
                  value={settings.texts?.about?.textColor || '#666666'}
                  onChange={(e) => handleSettingChange('texts', 'about', 'textColor', e.target.value)}
                  sx={{ 
                    '& input': { 
                      height: 40, 
                      cursor: 'pointer',
                      padding: '4px 8px'
                    },
                    '& .MuiOutlinedInput-root': {
                      padding: '8px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Başlık Boyutu"
                  type="number"
                  value={settings.texts?.about?.titleSize || 32}
                  onChange={(e) => handleSettingChange('texts', 'about', 'titleSize', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 16, max: 48 } }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SettingsSection>

      <SettingsSection title="Footer Ayarları">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Footer bölümündeki metinleri ve sosyal medya ikonlarını özelleştirebilirsiniz.
        </Typography>
        
        <Grid container spacing={3}>
          {/* Sol Metin Ayarları */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Sol Metin</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Metin"
                  value={settings.footer?.leftText?.text || ''}
                  onChange={(e) => handleSettingChange('footer', 'leftText', 'text', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Rengi"
                  type="color"
                  value={settings.footer?.leftText?.color || '#666666'}
                  onChange={(e) => handleSettingChange('footer', 'leftText', 'color', e.target.value)}
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Boyutu"
                  type="number"
                  value={settings.footer?.leftText?.fontSize || 14}
                  onChange={(e) => handleSettingChange('footer', 'leftText', 'fontSize', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 10, max: 24 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Kalınlığı"
                  type="number"
                  value={settings.footer?.leftText?.fontWeight || 400}
                  onChange={(e) => handleSettingChange('footer', 'leftText', 'fontWeight', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 100, max: 900, step: 100 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Sağ Metin Ayarları */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Sağ Metin</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Metin"
                  value={settings.footer?.rightText?.text || ''}
                  onChange={(e) => handleSettingChange('footer', 'rightText', 'text', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Rengi"
                  type="color"
                  value={settings.footer?.rightText?.color || '#666666'}
                  onChange={(e) => handleSettingChange('footer', 'rightText', 'color', e.target.value)}
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Boyutu"
                  type="number"
                  value={settings.footer?.rightText?.fontSize || 14}
                  onChange={(e) => handleSettingChange('footer', 'rightText', 'fontSize', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 10, max: 24 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Yazı Kalınlığı"
                  type="number"
                  value={settings.footer?.rightText?.fontWeight || 400}
                  onChange={(e) => handleSettingChange('footer', 'rightText', 'fontWeight', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 100, max: 900, step: 100 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Sosyal Medya Ayarları */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Sosyal Medya İkonları</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="İkon Rengi"
                  type="color"
                  value={settings.footer?.socialMedia?.color || '#666666'}
                  onChange={(e) => handleSettingChange('footer', 'socialMedia', 'color', e.target.value)}
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
            </Grid>
            
            {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'amazon'].map((platform) => (
              <Grid container spacing={2} key={platform} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.footer?.socialMedia?.[platform]?.enabled ?? false}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          handleSettingChange('footer', 'socialMedia', `${platform}.enabled`, newValue);
                        }}
                      />
                    }
                    label={platform === 'amazon' ? 'Amazon Store' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="URL"
                    value={settings.footer?.socialMedia?.[platform]?.url || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      handleSettingChange('footer', 'socialMedia', `${platform}.url`, newValue);
                    }}
                    disabled={!settings.footer?.socialMedia?.[platform]?.enabled}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </SettingsSection>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ ...previewDialog, open: false })}
      >
        <DialogTitle>Resim Önizleme</DialogTitle>
        <DialogContent>
          {previewDialog.image && (
            <img
              src={previewDialog.image.path}
              alt="Preview"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ ...previewDialog, open: false })}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 