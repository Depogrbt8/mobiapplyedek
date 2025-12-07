/**
 * Module Registry
 * Central registry for all modules in the super app
 * Allows modules to register themselves and be discovered dynamically
 */

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  icon?: string;
  screens?: string[];
  navigation?: any;
}

export interface ModuleRegistry {
  register(module: ModuleConfig): void;
  getModule(id: string): ModuleConfig | undefined;
  getAllModules(): ModuleConfig[];
  getEnabledModules(): ModuleConfig[];
  isModuleEnabled(id: string): boolean;
}

class ModuleRegistryImpl implements ModuleRegistry {
  private modules: Map<string, ModuleConfig> = new Map();

  register(module: ModuleConfig): void {
    this.modules.set(module.id, module);
  }

  getModule(id: string): ModuleConfig | undefined {
    return this.modules.get(id);
  }

  getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }

  getEnabledModules(): ModuleConfig[] {
    return Array.from(this.modules.values()).filter((m) => m.enabled);
  }

  isModuleEnabled(id: string): boolean {
    const module = this.modules.get(id);
    return module?.enabled ?? false;
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistryImpl();

// Register modules
// Travel Module (İlk Faz - Aktif)
moduleRegistry.register({
  id: 'travel',
  name: 'Seyahat',
  enabled: true,
  icon: 'plane',
  screens: [
    'Travel/FlightSearch',
    'Travel/FlightResults',
    'Travel/FlightDetails',
    'Travel/HotelSearch',
    'Travel/CarSearch',
  ],
});

// Transfer Module (Gelecek - Şimdilik Kapalı)
moduleRegistry.register({
  id: 'transfer',
  name: 'Para Transferi',
  enabled: false, // FAZ 5'te aktif olacak
  icon: 'money',
});

// Games Module (Gelecek - Şimdilik Kapalı)
moduleRegistry.register({
  id: 'games',
  name: 'Oyunlar',
  enabled: false, // FAZ 6'da aktif olacak
  icon: 'gamepad',
});

// Social Module (Gelecek - Şimdilik Kapalı)
moduleRegistry.register({
  id: 'social',
  name: 'Sosyal',
  enabled: false, // FAZ 7'de aktif olacak
  icon: 'users',
});

