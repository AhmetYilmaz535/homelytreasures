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
  Delete as DeleteIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';
import {
  getAllAvailableImages,
  getSelectedImages,
  saveSelectedImages,
  addCustomImage,
  updateImageOrder,
  getSliderSettings,
  updateSliderSettings,
  deleteImage,
  defaultSettings
} from '../utils/imageStore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { storage } from '../firebase/index';

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
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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

  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showMessage('Lütfen geçerli bir resim dosyası seçin!', 'error');
      return;
    }

    // Dosya boyutu kontrolü (2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      showMessage('Logo boyutu 2MB\'dan büyük olamaz!', 'error');
      return;
    }

    setLoading(true);
    try {
      // Resmi yükle
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Eski logoyu sil
      if (settings.logo?.path) {
        try {
          const oldLogoRef = ref(storage, settings.logo.path);
          await deleteObject(oldLogoRef);
        } catch (error) {
          console.warn('Error deleting old logo:', error);
        }
      }

      // Yeni logoyu yükle
      const storageRef = ref(storage, `site_assets/logo_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      
      // Upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }
      );

      // Upload complete
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Logo path'ini güncelle
      await handleSettingChange('logo', '', 'path', downloadURL);
      showMessage('Logo başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showMessage(error.message || 'Logo yüklenirken bir hata oluştu!', 'error');
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
      
      // Sadece değişen ayarı güncelle
      let updateData = {};
      
      if (section === 'effects') {
        updateData = {
          effects: {
            ...settings.effects,
            [subsection]: {
              ...settings.effects[subsection],
              [key]: value
            }
          }
        };
      } else if (section === 'texts') {
        updateData = {
          texts: {
            ...settings.texts,
            [subsection]: {
              ...settings.texts[subsection],
              [key]: value
            }
          }
        };
      } else if (section === 'footer') {
        if (subsection === 'socialMedia' && key.includes('.')) {
          const [platform, field] = key.split('.');
          updateData = {
            footer: {
              ...settings.footer,
              socialMedia: {
                ...settings.footer.socialMedia,
                [platform]: {
                  ...settings.footer.socialMedia[platform],
                  [field]: value
                }
              }
            }
          };
        } else {
          updateData = {
            footer: {
              ...settings.footer,
              [subsection]: {
                ...settings.footer[subsection],
                [key]: value
              }
            }
          };
        }
      } else if (section === 'logo') {
        // Logo ayarlarını güncelle
        updateData = {
          logo: {
            ...settings.logo,
            [key]: value || '' // undefined yerine boş string kullan
          }
        };
      } else {
        // Genel ayarlar için
        updateData = {
          [key]: value
        };
      }
      
      // Firebase'e kaydet
      const result = await updateSliderSettings(updateData);
      
      if (result) {
        // Yerel state'i güncelle
        if (section === 'effects') {
          newSettings.effects[subsection][key] = value;
        } else if (section === 'texts') {
          newSettings.texts[subsection][key] = value;
        } else if (section === 'footer') {
          if (subsection === 'socialMedia' && key.includes('.')) {
            const [platform, field] = key.split('.');
            newSettings.footer.socialMedia[platform][field] = value;
          } else {
            newSettings.footer[subsection][key] = value;
          }
        } else if (section === 'logo') {
          if (!newSettings.logo) {
            newSettings.logo = {};
          }
          newSettings.logo[key] = value || ''; // undefined yerine boş string kullan
        } else {
          newSettings[key] = value;
        }
        
        setSettings(newSettings);
        setUnsavedChanges(true);
      }
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

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const result = await updateSliderSettings(settings);
      if (result) {
        setUnsavedChanges(false);
        showMessage('Ayarlar başarıyla kaydedildi!');
      } else {
        throw new Error('Ayarlar kaydedilemedi.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Ayarlar kaydedilirken bir hata oluştu: ' + error.message, 'error');
    } finally {
      setLoading(false);
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

  const handleResetEffects = async () => {
    try {
      setLoading(true);
      // Mevcut ayarları kopyala
      const currentSettings = { ...settings };
      
      // Sadece effects kısmını varsayılan değerlerle değiştir
      currentSettings.effects = {
        kenBurns: { ...defaultSettings.effects.kenBurns },
        transition: { ...defaultSettings.effects.transition },
        filmGrain: { ...defaultSettings.effects.filmGrain }
      };
      
      // Firebase'e kaydet
      const result = await updateSliderSettings(currentSettings);
      
      if (result) {
        setSettings(currentSettings);
        setUnsavedChanges(false);
        showMessage('Efekt ayarları varsayılan değerlere döndürüldü ve kaydedildi.');
      } else {
        throw new Error('Ayarlar kaydedilemedi.');
      }
    } catch (error) {
      console.error('Error resetting effects:', error);
      showMessage('Efekt ayarları sıfırlanırken bir hata oluştu: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return null;

  return (
    <Box>
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1100,
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2
      }}>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<RestartAltIcon />}
          onClick={handleResetEffects}
          disabled={loading}
        >
          Efektleri Sıfırla
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          disabled={!unsavedChanges || loading}
        >
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </Box>

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

      <SettingsSection title="Genel Ayarlar">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Logo Ayarları</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.logo?.enabled || false}
                      onChange={(e) => handleSettingChange('logo', '', 'enabled', e.target.checked)}
                    />
                  }
                  label="Logo Göster"
                />
              </Grid>
              {settings?.logo?.enabled && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={loading}
                      >
                        Logo Yükle
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                        />
                      </Button>
                      {settings.logo.path && (
                        <Box
                          component="img"
                          src={settings.logo.path}
                          alt="Logo Önizleme"
                          sx={{
                            maxWidth: '200px',
                            height: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Genişlik (px)"
                      type="number"
                      value={settings.logo?.width || 150}
                      onChange={(e) => handleSettingChange('logo', '', 'width', parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 50, max: 500 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Yükseklik (px)"
                      type="number"
                      value={settings.logo?.height || 50}
                      onChange={(e) => handleSettingChange('logo', '', 'height', parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 20, max: 200 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Alt Metni"
                      value={settings.logo?.alt || 'Site Logo'}
                      onChange={(e) => handleSettingChange('logo', '', 'alt', e.target.value)}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.autoplay || false}
                  onChange={(e) => handleSettingChange('', '', 'autoplay', e.target.checked)}
                />
              }
              label="Otomatik Geçiş"
            />
            {settings?.autoplay && (
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Otomatik Geçiş Süresi (saniye)
                </Typography>
                <MuiSlider
                  value={settings?.autoplaySpeed || 6000}
                  onChange={(e, value) => handleSettingChange('', '', 'autoplaySpeed', value)}
                  min={2000}
                  max={10000}
                  step={1000}
                  marks={[
                    { value: 2000, label: '2s' },
                    { value: 6000, label: '6s' },
                    { value: 10000, label: '10s' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value/1000}s`}
                  sx={{ maxWidth: 300 }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </SettingsSection>

      <SettingsSection title="Ken Burns Efekti">
        <FormControlLabel
          control={
            <Switch
              checked={settings.effects.kenBurns.enabled}
              onChange={(e) => handleSettingChange('effects', 'kenBurns', 'enabled', e.target.checked)}
            />
          }
          label="Ken Burns Efektini Etkinleştir"
        />
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Efekt Süresi (saniye)</Typography>
          <MuiSlider
            value={settings.effects.kenBurns.duration / 1000}
            onChange={(e, value) => handleSettingChange('effects', 'kenBurns', 'duration', value * 1000)}
            min={5}
            max={30}
            step={1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}s`}
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
              setUnsavedChanges(true);
            }}
            min={100}
            max={150}
            step={1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
        </Box>
      </SettingsSection>

      <SettingsSection title="Geçiş Efektleri">
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Geçiş Süresi (milisaniye)</Typography>
          <MuiSlider
            value={settings.effects.transition.duration}
            onChange={(e, value) => handleSettingChange('effects', 'transition', 'duration', value)}
            min={100}
            max={5000}
            step={100}
            marks={[
              { value: 100, label: '100ms' },
              { value: 500, label: '500ms' },
              { value: 1000, label: '1s' },
              { value: 2500, label: '2.5s' },
              { value: 5000, label: '5s' }
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}ms`}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Bulanıklık Miktarı (px)</Typography>
          <MuiSlider
            value={settings.effects.transition.blurAmount}
            onChange={(e, value) => handleSettingChange('effects', 'transition', 'blurAmount', value)}
            min={0}
            max={10}
            step={1}
            marks={[
              { value: 0, label: '0' },
              { value: 5, label: '5px' },
              { value: 10, label: '10px' }
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}px`}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Karartma Opaklığı</Typography>
          <MuiSlider
            value={settings.effects.transition.darkOverlay}
            onChange={(e, value) => handleSettingChange('effects', 'transition', 'darkOverlay', value)}
            min={0}
            max={0.5}
            step={0.05}
            marks={[
              { value: 0, label: '0' },
              { value: 0.25, label: '0.25' },
              { value: 0.5, label: '0.5' }
            ]}
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
                  onChange={(e) => handleSettingChange('effects', 'filmGrain', 'enabled', e.target.checked)}
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
                  onChange={(e, value) => handleSettingChange('effects', 'filmGrain', 'opacity', value)}
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
                  onChange={(e, value) => handleSettingChange('effects', 'filmGrain', 'animationSpeed', value)}
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