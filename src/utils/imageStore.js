// Varsayılan resimler
const defaultImages = [
  { id: 1, path: '/images/ana1.jpg', order: 1 },
  { id: 2, path: '/images/ana2.jpg', order: 2 },
  { id: 3, path: '/images/ana3.jpg', order: 3 },
  { id: 4, path: '/images/ana4.jpg', order: 4 }
];

const defaultSettings = {
  autoplay: true,
  autoplaySpeed: 5000,
  effects: {
    kenBurns: {
      enabled: true,
      duration: 20,
      zoomRange: { min: 1.0, max: 1.2 }
    },
    transition: {
      duration: 1.5,
      blurAmount: 10,
      darkOverlay: 0.2
    },
    filmGrain: {
      enabled: true,
      opacity: 0.05,
      animationSpeed: 8
    }
  },
  texts: {
    heading: {
      text: "Welcome Dashboard",
      color: "#000000",
      fontSize: 32,
      fontWeight: 600
    },
    subheading: {
      text: "Manage your content and settings",
      color: "#666666",
      fontSize: 16,
      fontWeight: 400
    },
    header: {
      text: "Image Slider Dashboard",
      color: "#A67C52",
      fontSize: 20,
      fontWeight: 700
    }
  },
  footer: {
    leftText: {
      text: "© 2024 Image Slider. Tüm hakları saklıdır.",
      color: "#666666",
      fontSize: 14,
      fontWeight: 400
    },
    rightText: {
      text: "İletişim: info@imageslider.com",
      color: "#666666",
      fontSize: 14,
      fontWeight: 400
    },
    socialMedia: {
      color: "#666666",
      facebook: { 
        enabled: false, 
        url: "https://facebook.com" 
      },
      twitter: { 
        enabled: false, 
        url: "https://twitter.com" 
      },
      instagram: { 
        enabled: false, 
        url: "https://instagram.com" 
      },
      linkedin: { 
        enabled: false, 
        url: "https://linkedin.com" 
      },
      youtube: { 
        enabled: false, 
        url: "https://youtube.com" 
      },
      amazon: {
        enabled: false,
        url: "https://amazon.com"
      }
    }
  }
};

// Seçili resimleri localStorage'dan al
export const getSelectedImages = () => {
  try {
    const stored = localStorage.getItem('selectedImages');
    if (!stored) {
      // Eğer localStorage'da kayıtlı resim yoksa varsayılan resimleri kaydet
      saveSelectedImages(defaultImages);
      return defaultImages;
    }
    const parsedImages = JSON.parse(stored);
    return parsedImages.length > 0 ? parsedImages : defaultImages;
  } catch (error) {
    console.error('Error loading images:', error);
    return defaultImages;
  }
};

// Seçili resimleri localStorage'a kaydet
export const saveSelectedImages = (images) => {
  try {
    localStorage.setItem('selectedImages', JSON.stringify(images));
    window.dispatchEvent(new Event('settingsChanged'));
  } catch (error) {
    console.error('Error saving images:', error);
  }
};

// Slider ayarlarını al
export const getSliderSettings = () => {
  const settings = localStorage.getItem('sliderSettings');
  return settings ? JSON.parse(settings) : defaultSettings;
};

// Slider ayarlarını güncelle
export const updateSliderSettings = (newSettings) => {
  try {
    localStorage.setItem('sliderSettings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('settingsChanged'));
  } catch (error) {
    console.error('Error updating settings:', error);
  }
};

// Yeni resim ekle
export const addCustomImage = async (file) => {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const newImage = {
          id: Date.now(),
          path: reader.result,
          order: defaultImages.length + 1
        };
        const currentImages = getAllAvailableImages();
        const updatedImages = [...currentImages, newImage];
        localStorage.setItem('availableImages', JSON.stringify(updatedImages));
        resolve(newImage);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error adding image:', error);
    throw error;
  }
};

// Tüm mevcut resimleri al
export const getAllAvailableImages = () => {
  try {
    const stored = localStorage.getItem('availableImages');
    return stored ? JSON.parse(stored) : defaultImages;
  } catch (error) {
    console.error('Error getting available images:', error);
    return defaultImages;
  }
};

// Resim sırasını güncelle
export const updateImageOrder = (images) => {
  try {
    localStorage.setItem('availableImages', JSON.stringify(images));
    return images;
  } catch (error) {
    console.error('Error updating image order:', error);
    return images;
  }
}; 