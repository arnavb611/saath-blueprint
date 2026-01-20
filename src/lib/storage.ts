// LocalStorage-based data persistence

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  area: string;
  experience: string;
  price: string;
  photo: string;
  rating: number;
  reviews: number;
  available: boolean;
  verified: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  service: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  createdAt: string;
  scheduledAt: string;
  workerLocation?: { lat: number; lng: number };
  estimatedArrival?: number;
}

export interface Service {
  id: string;
  emoji: string;
  name: string;
  description: string;
  basePrice: string;
  count: number;
}

export interface WorkerApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  area: string;
  experience: string;
  expectedPrice: string;
  photo: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Storage keys
const KEYS = {
  WORKERS: 'saath_workers',
  USERS: 'saath_users',
  BOOKINGS: 'saath_bookings',
  SERVICES: 'saath_services',
  APPLICATIONS: 'saath_applications',
  CURRENT_USER: 'saath_current_user',
};

// Default services
const defaultServices: Service[] = [
  { id: '1', emoji: '🧹', name: 'Home Cleaning', description: 'Professional deep cleaning for your space', basePrice: '₹500', count: 0 },
  { id: '2', emoji: '👶', name: 'Baby Care', description: 'Trained nannies and babysitters', basePrice: '₹600', count: 0 },
  { id: '3', emoji: '👴', name: 'Elder Care', description: 'Compassionate care for seniors', basePrice: '₹800', count: 0 },
  { id: '4', emoji: '🍳', name: 'Cooking', description: 'Skilled home cooks for daily meals', basePrice: '₹400', count: 0 },
  { id: '5', emoji: '🔧', name: 'Repairs', description: 'Electricians, plumbers & more', basePrice: '₹300', count: 0 },
  { id: '6', emoji: '🚗', name: 'Driver', description: 'Reliable personal & family drivers', basePrice: '₹500', count: 0 },
  { id: '7', emoji: '🌿', name: 'Gardening', description: 'Garden care and landscaping', basePrice: '₹350', count: 0 },
  { id: '8', emoji: '📚', name: 'Tutoring', description: 'Private tutors for all subjects', basePrice: '₹450', count: 0 },
  { id: '9', emoji: '🐕', name: 'Pet Care', description: 'Pet sitting, grooming & walking', basePrice: '₹300', count: 0 },
];

// Default admin user
const defaultAdmin: User = {
  id: 'admin_001',
  email: 'admin@saath.com',
  password: 'admin123',
  name: 'Admin',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// Sample workers
const defaultWorkers: Worker[] = [
  {
    id: 'w1',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya@example.com',
    service: 'Home Cleaning',
    area: 'Indiranagar',
    experience: '5 years',
    price: '₹500/visit',
    photo: '',
    rating: 4.9,
    reviews: 127,
    available: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w2',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43211',
    email: 'rajesh@example.com',
    service: 'Repairs',
    area: 'Koramangala',
    experience: '8 years',
    price: '₹300/hr',
    photo: '',
    rating: 4.8,
    reviews: 89,
    available: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w3',
    name: 'Sunita Devi',
    phone: '+91 98765 43212',
    email: 'sunita@example.com',
    service: 'Elder Care',
    area: 'HSR Layout',
    experience: '10 years',
    price: '₹800/day',
    photo: '',
    rating: 5.0,
    reviews: 156,
    available: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
];

// Initialize storage with defaults
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(defaultServices));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([defaultAdmin]));
  }
  if (!localStorage.getItem(KEYS.WORKERS)) {
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(defaultWorkers));
    // Update service counts
    updateServiceCounts();
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.APPLICATIONS)) {
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify([]));
  }
};

// Update service worker counts
const updateServiceCounts = () => {
  const workers = getWorkers();
  const services = getServices();
  
  const updatedServices = services.map(service => ({
    ...service,
    count: workers.filter(w => w.service === service.name && w.verified).length,
  }));
  
  localStorage.setItem(KEYS.SERVICES, JSON.stringify(updatedServices));
};

// Workers
export const getWorkers = (): Worker[] => {
  const data = localStorage.getItem(KEYS.WORKERS);
  return data ? JSON.parse(data) : [];
};

export const addWorker = (worker: Omit<Worker, 'id' | 'createdAt'>): Worker => {
  const workers = getWorkers();
  const newWorker: Worker = {
    ...worker,
    id: `w_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  workers.push(newWorker);
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  updateServiceCounts();
  return newWorker;
};

export const updateWorker = (id: string, updates: Partial<Worker>): Worker | null => {
  const workers = getWorkers();
  const index = workers.findIndex(w => w.id === id);
  if (index === -1) return null;
  
  workers[index] = { ...workers[index], ...updates };
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  updateServiceCounts();
  return workers[index];
};

export const deleteWorker = (id: string): boolean => {
  const workers = getWorkers();
  const filtered = workers.filter(w => w.id !== id);
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(filtered));
  updateServiceCounts();
  return filtered.length < workers.length;
};

export const getWorkersByService = (service: string): Worker[] => {
  return getWorkers().filter(w => w.service === service && w.verified);
};

// Services
export const getServices = (): Service[] => {
  const data = localStorage.getItem(KEYS.SERVICES);
  return data ? JSON.parse(data) : defaultServices;
};

export const updateService = (id: string, updates: Partial<Service>): Service | null => {
  const services = getServices();
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  services[index] = { ...services[index], ...updates };
  localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  return services[index];
};

// Users & Auth
export const getUsers = (): User[] => {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const login = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const register = (email: string, password: string, name: string): User | null => {
  const users = getUsers();
  if (users.find(u => u.email === email)) return null;
  
  const newUser: User = {
    id: `u_${Date.now()}`,
    email,
    password,
    name,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
  return newUser;
};

// Bookings
export const getBookings = (): Booking[] => {
  const data = localStorage.getItem(KEYS.BOOKINGS);
  return data ? JSON.parse(data) : [];
};

export const getUserBookings = (userId: string): Booking[] => {
  return getBookings().filter(b => b.userId === userId);
};

export const createBooking = (booking: Omit<Booking, 'id' | 'createdAt'>): Booking => {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: `b_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  return newBooking;
};

export const updateBooking = (id: string, updates: Partial<Booking>): Booking | null => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index] = { ...bookings[index], ...updates };
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  return bookings[index];
};

// Worker Applications
export const getApplications = (): WorkerApplication[] => {
  const data = localStorage.getItem(KEYS.APPLICATIONS);
  return data ? JSON.parse(data) : [];
};

export const submitApplication = (app: Omit<WorkerApplication, 'id' | 'createdAt' | 'status'>): WorkerApplication => {
  const apps = getApplications();
  const newApp: WorkerApplication = {
    ...app,
    id: `app_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  apps.push(newApp);
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  return newApp;
};

export const updateApplicationStatus = (id: string, status: WorkerApplication['status']): WorkerApplication | null => {
  const apps = getApplications();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  apps[index] = { ...apps[index], status };
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  
  // If approved, create worker
  if (status === 'approved') {
    const app = apps[index];
    addWorker({
      name: app.name,
      phone: app.phone,
      email: app.email,
      service: app.service,
      area: app.area,
      experience: app.experience,
      price: app.expectedPrice,
      photo: app.photo,
      rating: 5.0,
      reviews: 0,
      available: true,
      verified: true,
    });
  }
  
  return apps[index];
};

// Initialize on import
initializeStorage();
