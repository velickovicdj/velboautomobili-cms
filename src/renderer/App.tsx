import "./App.css"
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Car,
  Edit2,
  Trash2,
  Eye,
  Plus,
  Save,
} from "lucide-react";

import { LogoImage } from "../../assets/logo";

interface Listing {
  id: string;
  marka: string;
  model: string;
  godina: number;
  gorivo: string;
  kilometraza: number;
  cena: number;
  cena_snizena?: number;
  cena_fiksna: boolean;
  karoserija: string;
  kubikaza: number;
  snaga: number;
  menjac: string;
  boja: string;
  broj_vrata: number;
  broj_sedista: number;
  emisiona_klasa: string;
  pogon: string;
  poreklo: string;
  prva_registracija: string;
  broj_vlasnika: number;
  oprema: string[];
  opis: string;
  slike: string[];
  status: string;
  istaknuto: boolean;
  datum_objave?: string;
  slug: string;
}

interface ImageUpload {
  preview: string;
  file: File;
  name: string;
}

const VelboAutomobiliCMS: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [uploadedImages, setUploadedImages] = useState<ImageUpload[]>([]);
  const [listingImages, setListingImages] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  const [formData, setFormData] = useState<Omit<Listing, "id">>({
    marka: "",
    model: "",
    godina: new Date().getFullYear(),
    gorivo: "Dizel",
    kilometraza: 0,
    cena: 0,
    cena_snizena: 0,
    cena_fiksna: false,
    karoserija: "Limuzina",
    kubikaza: 0,
    snaga: 0,
    menjac: "Manuelni",
    boja: "",
    broj_vrata: 5,
    broj_sedista: 5,
    emisiona_klasa: "EURO 6",
    pogon: "Prednji pogon",
    poreklo: "",
    prva_registracija: "",
    broj_vlasnika: 1,
    oprema: [],
    opis: "",
    slike: [],
    status: "dostupno",
    istaknuto: false,
    slug: ""
  });

  const gorivoOptions = [
    "Benzin", 
    "Dizel", 
    "Hibrid", 
    "Električni", 
    "TNG", 
    "Benzin + TNG"
  ];

  const karoserijaOptions = [
    "Limuzina",
    "Hečbek",
    "Karavan",
    "Džip/SUV",
    "Kupe",
    "Kabriolet",
    "Monovolumen (MiniVan)",
    "Pickup",
  ];

  const menjacOptions = [
    "Manuelni",
    "Manuelni 5 brzina",
    "Manuelni 6 brzina",
    "Automatski",
    "Automatski / poluautomatski"
  ];

  const pogonOptions = ["Prednji pogon", "Zadnji pogon", "4x4 (Pogon na sva četiri točka)"];

  const opremaList: string[] = [
    "Metallic boja",
    "Branici u boji auta",
    "Servo volan",
    "Multifunkcionalni volan",
    "Tempomat",
    "Adaptivni tempomat",
    "Daljinsko zaključavanje",
    "Centralna brava",
    "Alarm",
    "Alarmni senzori",
    "Sigurnosna vrata",
    "Immobilizer",
    "ABS",
    "ESP",
    "ASR (Kontrola proklizavanja)",
    "EBD",
    "BAS",
    "Airbag (Vazdušni jastuci)",
    "Bočni vazdušni jastuci",
    "Zavesice vazdušni jastuci",
    "Knee airbag",
    "Start-stop sistem",
    "Električni podizači",
    "Električni retrovizori",
    "Skopivi retrovizori",
    "Automatski sklopivi retrovizori",
    "Grejači retrovizora",
    "Grejanje vetrobrana",
    "Tonirana stakla",
    "Privatna stakla (zatamnjena)",
    "Grejanje zadnjeg stakla",
    "Klima",
    "Automatska klima",
    "Dual-zona klima",
    "Tri-zone klima",
    "Četiri-zone klima",
    "Putni računar",
    "Navigacija",
    "Bluetooth",
    "USB",
    "AUX konekcija",
    "Radio CD",
    "MP3",
    "CD changer",
    "Android Auto / Apple CarPlay",
    "Ekran na dodir",
    "Multimedija",
    "Handsfree",
    "Bežično punjenje telefona",
    "Sedišta podesiva po visini",
    "Elektro podesiva sedišta",
    "Memorija sedišta",
    "Grejanje sedišta",
    "Hlađenje sedišta",
    "Masažna sedišta",
    "Kožni enterier",
    "Polukožna sedišta",
    "Alcantara enterijer",
    "Kožni volan",
    "Naslon za ruku",
    "Naslon za ruku zadnji",
    "Držači za čaše",
    "Ostava sa hlađenjem",
    "Dnevna svetla",
    "LED prednja svetla",
    "LED zadnja svetla",
    "Xenon svetla",
    "Bi-Xenon",
    "Matrix LED",
    "Laser svetla",
    "Svetla za maglu",
    "Senzori za svetla",
    "Senzori za kišu",
    "Tempomat sa radarom",
    "Parking senzori napred",
    "Parking senzori nazad",
    "360 kamera",
    "Kamera za vožnju unazad",
    "Automatsko parkiranje",
    "Aluminijumske felne",
    "Čelične felne",
    "Rezervni točak",
    "Set za krpljenje gume",
    "Panoramski krov",
    "Šiber",
    "Stakleni krov",
    "Krovni nosači",
    "Utičnica 12V",
    "Utičnica 230V",
    "ISOFIX sistem",
    "DPF filter",
    "AdBlue sistem",
    "Elektronska ručna kočnica",
    "Auto Hold",
    "Keyless Go",
    "Keyless Entry",
    "Remote start",
    "Limitator brzine",
    "Podešavanje volana po visini",
    "Podešavanje volana po dubini",
    "Ambijentalno osvetljenje",
    "Head-Up Display",
    "Bočni asistenti",
    "Upozorenje na mrtav ugao",
    "Upozorenje na napuštanje trake",
    "Asistencija za zadržavanje trake",
    "Asistencija za praćenje trake",
    "Prepoznavanje saobraćajnih znakova",
    "Automatsko kočenje",
    "Asistencija za sudar",
    "Asistencija za nizbrdicu",
    "Hill Start Assist",
    "Upozorenje na umor vozača",
    "Kontrola pritiska u gumama",
    "Električno otvaranje gepeka",
    "Električno zatvaranje gepeka",
    "Handsfree gepek (otvaranje nogom)",
    "Pneumatsko vešanje",
    "Sport mod",
    "Offroad mod",
    "Auto-prestrojavanje",
    "Špera diferencijala",
    "Diferencijal sa ograničenim proklizavanjem",
    "Kuka za vuču",
    "Krovni kofer",
    "Filter kabine (HEPA)",
    "Pomoć pri vožnji na autoputu",
    "Pomoć pri vožnji u koloni"
  ];


  // 1. useEffect za proveru localStorage i inicijalno učitavanje
  useEffect(() => {
    const savedFolder = getDataFolder();
    console.log("Saved folder from localStorage:", savedFolder);
    
    if (savedFolder) {
      // Ako postoji sačuvan folder, učitaj oglase
      loadListings();
    } else {
      // Ako ne postoji, traži od korisnika
      (async () => {
        // @ts-ignore
        const folderPath = await window.electron.selectDataFolder();
        
        if (folderPath) {
          saveDataFolder(folderPath);
          loadListings();
        } else {
          showNotification("Morate odabrati folder za podatke", "error");
        }
      })();
    }
  }, []);

  // 2. useEffect za IPC listenere (promena foldera iz menija)
  useEffect(() => {
    // @ts-ignore
    window.electron.ipcRenderer.receive('open-folder-selector', async () => {
      // @ts-ignore
      const result = await window.electron.selectDataFolder();
      if (result) {
        saveDataFolder(result); // Sačuvaj u localStorage
        showNotification(`Folder podešen: ${result}`, 'success');
        await loadListings();
      }
    });

    // Novi listener za folder-changed
    // @ts-ignore
    window.electron.ipcRenderer.receive('folder-changed', async (newFolder: string) => {
      saveDataFolder(newFolder); // Sačuvaj u localStorage
      showNotification(`Folder promenjen: ${newFolder}`, 'success');
      await loadListings();
    });
  }, []);

  // 3. useEffect za učitavanje slika listinga
  useEffect(() => {
    const loadListingImages = async () => {
      const basePath = getBaseFolder();
      if (!basePath || listings.length === 0) return;
      
      const images: Record<string, string> = {};
      
      for (const listing of listings) {
        const imagePath = `${basePath}\\public\\vozila\\${listing.slug}\\${listing.slike[0]}.webp`;
        // @ts-ignore
        const base64Data = await window.electron.readImage(imagePath);
        if (base64Data) {
          images[listing.slug] = base64Data;
        }
      }
      
      setListingImages(images);
    };
    
    loadListingImages();
  }, [listings]);

  const getDataFolder = (): string | null => {
    return localStorage.getItem('dataFolderPath');
  };

  const getBaseFolder = (): string | null => {
    return localStorage.getItem('baseFolderPath');
  };

  const saveDataFolder = (basePath: string) => {
    localStorage.setItem('baseFolderPath', basePath);
    localStorage.setItem('dataFolderPath', `${basePath}/src/data/vozila`);
  };

  const loadListings = async () => {
    try {
      setLoading(true);
      
      let folderPath = getDataFolder();
      console.log("Loading from folder:", folderPath); // Debug
      
      if (!folderPath) {
        // @ts-ignore
        folderPath = await window.electron.selectDataFolder();
        
        if (!folderPath) {
          showNotification("Morate odabrati folder za podatke", "error");
          setLoading(false);
          return;
        }
        
        console.log("Saving to localStorage:", folderPath); // Debug
        saveDataFolder(folderPath);
      }
      
      // @ts-ignore
      const files: Listing[] = await window.electron.readListings(folderPath);
      console.log("Loaded listings:", files.length); // Debug
      setListings(files.filter(file => file.status === "dostupno"));
    } catch (error) {
      console.error("Error loading listings:", error);
      showNotification("Greška pri učitavanju oglasa", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...uploadedImages];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    setUploadedImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ImageUpload[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push({
          preview: event.target?.result as string,
          file,
          name: file.name,
        });
        if (newImages.length === files.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const toggleOprema = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      oprema: prev.oprema.includes(item)
        ? prev.oprema.filter((o) => o !== item)
        : [...prev.oprema, item],
    }));
  };

  const generateSlug = (marka: string, model: string) => {
    return `${marka}-${model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!formData.marka || !formData.model || !formData.cena) {
        showNotification("Molimo popunite sva obavezna polja", "error");
        setLoading(false);
        return;
      }

      if (uploadedImages.length === 0 && !editingListing) {
        showNotification("Molimo dodajte bar jednu sliku", "error");
        setLoading(false);
        return;
      }

      const slug = editingListing ? editingListing.slug : generateSlug(formData.marka, formData.model);
      const imageData = uploadedImages.map((img) => ({ data: img.preview, name: img.name }));

      const newImages = uploadedImages
        .filter(img => img.file !== null)
        .map((img) => ({ data: img.preview, name: img.name }));
      
      const existingImageNumbers = uploadedImages
        .filter(img => img.file === null)
        .map(img => img.name);

      const jsonData: Listing = {
        marka: formData.marka,
        model: formData.model,
        godina: Number(formData.godina),
        gorivo: formData.gorivo,
        kilometraza: Number(formData.kilometraza),
        cena: Number(formData.cena),
        ...(formData.cena_snizena && formData.cena_snizena > 0 && { cena_snizena: Number(formData.cena_snizena) }),
        cena_fiksna: formData.cena_fiksna,
        karoserija: formData.karoserija,
        kubikaza: Number(formData.kubikaza),
        snaga: Number(formData.snaga),
        menjac: formData.menjac,
        boja: formData.boja,
        broj_vrata: Number(formData.broj_vrata),
        broj_sedista: Number(formData.broj_sedista),
        emisiona_klasa: formData.emisiona_klasa,
        pogon: formData.pogon,
        poreklo: formData.poreklo,
        prva_registracija: formData.prva_registracija,
        broj_vlasnika: Number(formData.broj_vlasnika),
        oprema: formData.oprema,
        opis: formData.opis,
        slike: existingImageNumbers,
        status: formData.status,
        istaknuto: formData.istaknuto,
        id: slug,
        slug: slug,
        ...(editingListing ? {} : { datum_objave: new Date().toISOString() }),
      };

      const folderPath = getDataFolder();
      const basePath = getBaseFolder();
      
      if (!folderPath || !basePath) {
        showNotification("Folder za podatke nije podešen", "error");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const result = await window.electron.saveListing({
        listing: jsonData,
        images: newImages,
        isEdit: !!editingListing,
      }, folderPath, basePath);

      if (result.success) {
        showNotification(editingListing ? "Oglas ažuriran!" : "Oglas objavljen!");
        setShowForm(false);
        resetForm();
        await loadListings();
      } else {
        showNotification(result.error || "Greška pri čuvanju oglasa", "error");
      }
    } catch (err) {
      console.error("Error saving listing:", err);
      showNotification("Greška pri čuvanju oglasa", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listing: Listing) => {
    if (!confirm(`Obrisati oglas: ${listing.marka} ${listing.model}?`)) return;

    try {
      setLoading(true);
      
      const folderPath = getDataFolder();
      const basePath = getBaseFolder();

      if (!folderPath || !basePath) {
        showNotification("Folder za podatke nije podešen", "error");
        return;
      }
      
      // @ts-ignore
      const result = await window.electron.deleteListing(listing.slug, folderPath, basePath);

      if (result.success) {
        showNotification("Oglas obrisan!");
        await loadListings();
      } else {
        showNotification(result.error || "Greška pri brisanju oglasa", "error");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      showNotification("Greška pri brisanju oglasa", "error");
    } finally {
      setLoading(false);
    }
  };

  const editListing = async (listing: Listing) => {
    setEditingListing(listing);
    setFormData({ ...listing });
    
    const basePath = getBaseFolder();
    
    // Učitaj postojeće slike iz lokalnog foldera
    const existingImages: ImageUpload[] = [];
    
    for (let i = 0; i < listing.slike.length; i++) {
      const slikaUrl = listing.slike[i];
      const imagePath = `${basePath}\\public\\vozila\\${listing.slug}\\${slikaUrl}.webp`;
      
      // @ts-ignore
      const base64Data = await window.electron.readImage(imagePath);
      
      if (base64Data) {
        existingImages.push({
          preview: base64Data,
          file: null as any,
          name: slikaUrl, // Čuvaj originalni broj umesto 'existing-X'
        });
      }
    }
    
    setUploadedImages(existingImages);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      marka: "",
      model: "",
      godina: new Date().getFullYear(),
      gorivo: "Dizel",
      kilometraza: 0,
      cena: 0,
      cena_snizena: 0,
      cena_fiksna: false,
      karoserija: "Limuzina",
      kubikaza: 0,
      snaga: 0,
      menjac: "Manuelni",
      boja: "",
      broj_vrata: 5,
      broj_sedista: 5,
      emisiona_klasa: "EURO 6",
      pogon: "Prednji pogon",
      poreklo: "",
      prva_registracija: "",
      broj_vlasnika: 1,
      oprema: [],
      opis: "",
      slike: [],
      status: "dostupno",
      istaknuto: false,
      slug: "",
    });
    setUploadedImages([]);
    setEditingListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoImage 
              width={64} 
              height={64}
              classNames=""
            />
            {/* <h1 className="text-2xl font-bold text-gray-800">CMS</h1> */}
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} />
              Novi oglas
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showForm ? (
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-12">Učitavanje...</div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Nema oglasa</div>
            ) : (
              listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                  <div className="w-32 h-32 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={listingImages[listing.slug] || `https://velboautomobili.com/vozila/${listing.slug}/1.webp`}
                      draggable={false}
                      alt={`${listing.marka} ${listing.model}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      {listing.marka} {listing.model}
                    </h3>
                    <p className="text-gray-600">
                      {listing.godina} • {listing.kilometraza.toLocaleString()} km • {listing.gorivo}
                    </p>
                    <p className="text-xl font-bold text-blue-600 mt-2">{(listing.cena_snizena ?? listing.cena).toLocaleString()} €</p>
                    {listing.istaknuto && (
                      <span className="inline-block bg-yellow-400 text-xs px-2 py-1 rounded mt-2">
                        Istaknuto
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => editListing(listing)}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Izmeni
                    </button>
                    <button
                      onClick={() => deleteListing(listing)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Obriši
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingListing ? "Izmeni oglas" : "Novi oglas"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marka *</label>
                  <input
                    type="text"
                    value={formData.marka}
                    onChange={(e) => setFormData({ ...formData, marka: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Godina *</label>
                  <input
                    type="number"
                    value={formData.godina}
                    onChange={(e) => setFormData({ ...formData, godina: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kilometraža *</label>
                  <input
                    type="number"
                    value={formData.kilometraza}
                    onChange={(e) => setFormData({ ...formData, kilometraza: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cena (€) *</label>
                  <input
                    type="number"
                    value={formData.cena}
                    onChange={(e) => setFormData({ ...formData, cena: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Snižena cena (€)</label>
                  <input
                    type="number"
                    value={formData.cena_snizena || ""}
                    onChange={(e) => setFormData({ ...formData, cena_snizena: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.cena_fiksna}
                      onChange={(e) => setFormData({ ...formData, cena_fiksna: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Fiksna cena</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.istaknuto}
                      onChange={(e) => setFormData({ ...formData, istaknuto: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Istaknut oglas</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gorivo</label>
                  <select
                    value={formData.gorivo}
                    onChange={(e) => setFormData({ ...formData, gorivo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {gorivoOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Karoserija</label>
                  <select
                    value={formData.karoserija}
                    onChange={(e) => setFormData({ ...formData, karoserija: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {karoserijaOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Menjač</label>
                  <select
                    value={formData.menjac}
                    onChange={(e) => setFormData({ ...formData, menjac: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {menjacOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kubikaza (ccm)</label>
                  <input
                    type="number"
                    value={formData.kubikaza}
                    onChange={(e) => setFormData({ ...formData, kubikaza: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Snaga (KW)</label>
                  <input
                    type="number"
                    value={formData.snaga}
                    onChange={(e) => setFormData({ ...formData, snaga: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Boja</label>
                  <input
                    type="text"
                    value={formData.boja}
                    onChange={(e) => setFormData({ ...formData, boja: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slike</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Klikni da dodaš slike</span>
                  </label>
                </div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((img, i) => (
                    <div 
                      key={i} 
                      className={`relative aspect-video cursor-move transition-opacity ${
                        draggedIndex === i ? 'opacity-50' : 'opacity-100'
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                    >
                      <img 
                        src={img.preview} 
                        alt="" 
                        className="w-full h-full object-cover rounded pointer-events-none" 
                      />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {i + 1}
                      </div>
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Oprema</label>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {opremaList.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.oprema.includes(item)}
                        onChange={() => toggleOprema(item)}
                        className="w-4 h-4"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Opis</label>
                <textarea
                  value={formData.opis}
                  onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {loading ? "Čuvanje..." : editingListing ? "Sačuvaj izmene" : "Objavi oglas"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VelboAutomobiliCMS />} />
      </Routes>
    </Router>
  );
}
