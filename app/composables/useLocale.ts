export type Lang = 'en' | 'id'
export type Currency = 'USD' | 'IDR'

const translations = {
  en: {
    nav: {
      shop: 'Shop',
      collections: 'Collections',
      about: 'About',
      reviews: 'Reviews',
      contact: 'Contact',
      shopNow: 'Shop Now',
      backToHome: 'Back to Home',
    },
    hero: {
      explore: 'Explore Collections',
      story: 'Our Story',
      scroll: 'Scroll',
      fallbackTitle: 'Handcrafted in Bali',
      fallbackSubtitle: 'Jewelry that tells your story',
    },
    sections: {
      ourCraft: 'Our Craft',
      ourStory: 'Our Story',
      ourValues: 'Our Values',
      lovedByMany: 'Loved By Many',
      getInTouch: 'Get In Touch',
      collectionsFallback: 'Collections',
      collectionsSoon: 'Collections coming soon',
      testimonialsFallback: 'What Our Customers Say',
      reviewsSoon: 'Reviews coming soon',
      studioFallback: 'Visit Our Studio',
      viewCollection: 'View Collection',
    },
    about: {
      yearsCraft: 'Years of Craft',
      uniqueDesigns: 'Unique Designs',
      countries: 'Countries',
      fallbackTitle: 'Born from Balinese Tradition',
      fallbackBody: 'Each piece is lovingly handcrafted by Balinese artisans using traditional techniques passed down through generations. We use only the finest materials — sterling silver, 18k gold, and ethically sourced gemstones — to create jewelry that carries the spirit of Bali.',
    },
    sustainability: {
      fallbackTitle: 'Sustainably Crafted',
      fallbackBody: 'We are committed to ethical sourcing, fair trade practices, and supporting the local Balinese artisan community. Every purchase helps sustain traditional craftsmanship for future generations.',
      ecoTitle: 'Eco-Friendly',
      ecoDesc: 'Recycled metals and sustainable packaging in every order.',
      fairTitle: 'Fair Trade',
      fairDesc: 'Artisans are paid fairly and work in safe, dignified conditions.',
      ethTitle: 'Ethically Sourced',
      ethDesc: 'Gemstones and metals sourced with full traceability.',
      handTitle: 'Handmade',
      handDesc: 'Every piece individually crafted — never mass produced.',
    },
    contact: {
      location: 'Location',
      email: 'Email',
      followUs: 'Follow Us',
    },
    footer: {
      tagline: 'Handcrafted with love in Bali.',
      admin: 'Admin',
    },
    shop: {
      allJewelry: 'All Jewelry',
      pieces: (n: number) => `${n} piece${n !== 1 ? 's' : ''} available`,
      search: 'Search jewelry...',
      sortFeatured: 'Sort: Featured',
      sortPriceLow: 'Price: Low to High',
      sortPriceHigh: 'Price: High to Low',
      notFound: 'No pieces found',
      clearFilters: 'Clear filters',
      viewDetails: 'View Details',
      featured: 'Featured',
      interested: 'Interested in this piece?',
      whatsapp: 'Inquire via WhatsApp',
      emailInquiry: 'Send Email Inquiry',
      comingSoon: 'Online ordering coming soon',
      all: 'All',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      browseShop: 'Browse jewelry',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      loginToCheckout: 'Login to Checkout',
      addToCart: 'Add to Cart',
      orderSummary: 'Order Summary',
      sendOrderVia: 'Send your order via',
      orderWhatsApp: 'Order via WhatsApp',
      orderEmail: 'Order via Email',
      adminWillContact: 'Our team will confirm your order & arrange payment.',
    },
    inquiry: {
      waMessage: (name: string, price: string) =>
        `Hi, I'm interested in: ${name} (${price})`,
      emailSubject: (name: string) => `Inquiry: ${name}`,
      emailBody: (name: string, collection: string, price: string) =>
        `Hello,\n\nI am interested in the following piece:\n\nProduct: ${name}\nCollection: ${collection}\nPrice: ${price}\n\nPlease let me know availability and ordering details.\n\nThank you.`,
    },
    checkout: {
      backToShop: 'Back to Shop',
      title: 'Checkout',
      shippingDetails: 'Shipping Details',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email',
      address: 'Full Address',
      addressPlaceholder: 'Street name, house number, district',
      city: 'City',
      citySearchPlaceholder: 'Type city name to search...',
      citySelectRequired: 'Please select a city from the dropdown',
      province: 'Province',
      postalCode: 'Postal Code',
      notes: 'Notes (optional)',
      notesPlaceholder: 'Special instructions for courier or order notes...',
      shippingOptions: 'Shipping Method',
      loadingShipping: 'Getting shipping rates...',
      noShipping: 'No shipping options available for this location.',
      selectShippingRequired: 'Please select a shipping method',
      days: 'days',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      orderSummary: 'Order Summary',
      total: 'Total',
      placeOrder: 'Proceed to Payment',
      processing: 'Creating order...',
      continuePayment: 'Continue Payment',
      resetOrder: 'Change order details',
      terms: 'By continuing, you agree to our terms of service.',
      successTitle: 'Payment Confirmed!',
      successMessage: 'Thank you! Your payment has been confirmed. We will process and ship your order shortly.',
      pendingTitle: 'Awaiting Payment',
      pendingMessage: 'Your order has been created. Please complete your payment using the instructions sent to your email. Your order will be processed once payment is confirmed.',
      continueShopping: 'Continue Shopping',
      paymentFailed: 'Payment failed. Please try again.',
      errorGeneric: 'Something went wrong. Please try again.',
    },
  },
  id: {
    nav: {
      shop: 'Toko',
      collections: 'Koleksi',
      about: 'Tentang',
      reviews: 'Ulasan',
      contact: 'Kontak',
      shopNow: 'Belanja',
      backToHome: 'Kembali',
    },
    hero: {
      explore: 'Jelajahi Koleksi',
      story: 'Kisah Kami',
      scroll: 'Gulir',
      fallbackTitle: 'Dibuat dengan Tangan di Bali',
      fallbackSubtitle: 'Perhiasan yang menceritakan kisahmu',
    },
    sections: {
      ourCraft: 'Kerajinan Kami',
      ourStory: 'Kisah Kami',
      ourValues: 'Nilai Kami',
      lovedByMany: 'Dipercaya Banyak',
      getInTouch: 'Hubungi Kami',
      collectionsFallback: 'Koleksi',
      collectionsSoon: 'Koleksi segera hadir',
      testimonialsFallback: 'Kata Pelanggan Kami',
      reviewsSoon: 'Ulasan segera hadir',
      studioFallback: 'Kunjungi Studio Kami',
      viewCollection: 'Lihat Koleksi',
    },
    about: {
      yearsCraft: 'Tahun Berkarya',
      uniqueDesigns: 'Desain Unik',
      countries: 'Negara',
      fallbackTitle: 'Lahir dari Tradisi Bali',
      fallbackBody: 'Setiap perhiasan dibuat dengan penuh cinta oleh pengrajin Bali menggunakan teknik tradisional yang diwariskan turun-temurun. Kami hanya menggunakan bahan terbaik — perak sterling, emas 18k, dan permata yang bersumber secara etis.',
    },
    sustainability: {
      fallbackTitle: 'Dibuat Secara Berkelanjutan',
      fallbackBody: 'Kami berkomitmen pada pengadaan yang etis, praktik perdagangan yang adil, dan mendukung komunitas pengrajin lokal Bali. Setiap pembelian membantu melestarikan kerajinan tradisional untuk generasi mendatang.',
      ecoTitle: 'Ramah Lingkungan',
      ecoDesc: 'Logam daur ulang dan kemasan berkelanjutan di setiap pesanan.',
      fairTitle: 'Perdagangan Adil',
      fairDesc: 'Pengrajin dibayar setara dan bekerja dalam kondisi yang aman dan bermartabat.',
      ethTitle: 'Sumber yang Etis',
      ethDesc: 'Permata dan logam bersumber dengan keterlacakan penuh.',
      handTitle: 'Buatan Tangan',
      handDesc: 'Setiap perhiasan dibuat satu per satu — tidak pernah diproduksi massal.',
    },
    contact: {
      location: 'Lokasi',
      email: 'Email',
      followUs: 'Ikuti Kami',
    },
    footer: {
      tagline: 'Dibuat dengan cinta di Bali.',
      admin: 'Admin',
    },
    shop: {
      allJewelry: 'Semua Perhiasan',
      pieces: (n: number) => `${n} perhiasan tersedia`,
      search: 'Cari perhiasan...',
      sortFeatured: 'Urutan: Unggulan',
      sortPriceLow: 'Harga: Terendah',
      sortPriceHigh: 'Harga: Tertinggi',
      notFound: 'Tidak ada perhiasan',
      clearFilters: 'Hapus filter',
      viewDetails: 'Lihat Detail',
      featured: 'Unggulan',
      interested: 'Tertarik dengan perhiasan ini?',
      whatsapp: 'Tanya via WhatsApp',
      emailInquiry: 'Kirim Email Pertanyaan',
      comingSoon: 'Pemesanan online segera hadir',
      all: 'Semua',
    },
    cart: {
      title: 'Keranjang Belanja',
      empty: 'Keranjang Anda kosong',
      browseShop: 'Jelajahi perhiasan',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      loginToCheckout: 'Login untuk Checkout',
      addToCart: 'Tambah ke Keranjang',
      orderSummary: 'Ringkasan Pesanan',
      sendOrderVia: 'Kirim pesanan melalui',
      orderWhatsApp: 'Pesan via WhatsApp',
      orderEmail: 'Pesan via Email',
      adminWillContact: 'Tim kami akan mengkonfirmasi pesanan & mengatur pembayaran.',
    },
    inquiry: {
      waMessage: (name: string, price: string) =>
        `Halo, saya tertarik dengan: ${name} (${price})`,
      emailSubject: (name: string) => `Pertanyaan: ${name}`,
      emailBody: (name: string, collection: string, price: string) =>
        `Halo,\n\nSaya tertarik dengan perhiasan berikut:\n\nProduk: ${name}\nKoleksi: ${collection}\nHarga: ${price}\n\nMohon informasikan ketersediaan dan cara pemesanannya.\n\nTerima kasih.`,
    },
    checkout: {
      backToShop: 'Kembali ke Shop',
      title: 'Checkout',
      shippingDetails: 'Detail Pengiriman',
      fullName: 'Nama Lengkap',
      phone: 'No. Telepon',
      email: 'Email',
      address: 'Alamat Lengkap',
      addressPlaceholder: 'Nama jalan, nomor rumah, RT/RW, kelurahan',
      city: 'Kota / Kabupaten',
      citySearchPlaceholder: 'Ketik nama kota untuk mencari...',
      citySelectRequired: 'Harap pilih kota dari daftar dropdown',
      province: 'Provinsi',
      postalCode: 'Kode Pos',
      notes: 'Catatan (opsional)',
      notesPlaceholder: 'Pesan khusus untuk kurir atau catatan pesanan...',
      shippingOptions: 'Metode Pengiriman',
      loadingShipping: 'Mengambil tarif pengiriman...',
      noShipping: 'Tidak ada layanan pengiriman untuk kota ini.',
      selectShippingRequired: 'Harap pilih metode pengiriman',
      days: 'hari',
      subtotal: 'Subtotal',
      shipping: 'Pengiriman',
      orderSummary: 'Ringkasan Pesanan',
      total: 'Total',
      placeOrder: 'Lanjut ke Pembayaran',
      processing: 'Membuat pesanan...',
      continuePayment: 'Lanjutkan Pembayaran',
      resetOrder: 'Ubah detail pesanan',
      terms: 'Dengan melanjutkan, Anda menyetujui ketentuan layanan kami.',
      successTitle: 'Pembayaran Berhasil!',
      successMessage: 'Terima kasih! Pembayaran Anda telah dikonfirmasi. Kami akan segera memproses dan mengirimkan pesanan Anda.',
      pendingTitle: 'Menunggu Pembayaran',
      pendingMessage: 'Pesanan Anda telah dibuat. Silakan selesaikan pembayaran sesuai instruksi yang dikirim ke email Anda. Pesanan akan diproses setelah pembayaran dikonfirmasi.',
      continueShopping: 'Lanjut Belanja',
      paymentFailed: 'Pembayaran gagal. Silakan coba lagi.',
      errorGeneric: 'Terjadi kesalahan. Silakan coba lagi.',
    },
  },
} as const

export function useLocale() {
  const lang = useCookie<Lang>('soj_lang', { default: () => 'en' })
  const currency = useCookie<Currency>('soj_currency', { default: () => 'USD' })

  const t = computed(() => translations[lang.value])

  const { data: rateData } = useFetch<{ IDR: number; source: string }>('/api/exchange-rate', {
    key: 'exchange-rate',
    default: () => ({ IDR: 16000, source: 'fallback' }),
  })

  const exchangeRate = computed(() => rateData.value?.IDR ?? 16000)

  // Product prices are stored as IDR in the database
  function formatPrice(price: string | number) {
    const idr = Number(price)
    if (currency.value === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(idr)
    }
    const usd = idr / (exchangeRate.value || 16000)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd)
  }

  // Format an IDR amount in the user's chosen display currency
  function formatShipping(idr: number): string {
    if (currency.value === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(idr)
    }
    const usd = idr / (exchangeRate.value || 16000)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd)
  }

  function toggleLang() {
    lang.value = lang.value === 'en' ? 'id' : 'en'
  }

  function toggleCurrency() {
    currency.value = currency.value === 'USD' ? 'IDR' : 'USD'
  }

  return { lang, currency, t, exchangeRate, formatPrice, formatShipping, toggleLang, toggleCurrency }
}
