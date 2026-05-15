import {
  searchMonsters,
  searchSpells,
  searchEquipment,
  searchMagicItems,
  getMonster,
  getSpell,
  getEquipmentItem,
  getMagicItem,
} from "@/lib/open5e/client";

export type Tab = "monsters" | "spells" | "equipment" | "magicitems";

export interface Open5eItem {
  key: string;
  name: string;
}

export interface UIState {
  tab: Tab;
  query: string;
  monsterCrFilter: string;
  spellLevelFilter: string;
  page: number;
  pageSize: number;
  results: Open5eItem[];
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedItem: Open5eItem | null;
}

export class Open5eUIManager {
  state: UIState;
  onUpdate?: (state: UIState) => void;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(onUpdate?: (state: UIState) => void) {
    this.onUpdate = onUpdate;
    this.state = {
      tab: "monsters",
      query: "",
      monsterCrFilter: "",
      spellLevelFilter: "",
      page: 1,
      pageSize: 10,
      results: [],
      totalPages: 1,
      loading: false,
      error: null,
      selectedItem: null,
    };
  }

  private notify() {
    this.onUpdate?.({ ...this.state });
  }

  async setTab(tab: Tab): Promise<void> {
    this.state.tab = tab;
    this.state.page = 1;
    this.state.selectedItem = null;
    this.notify();
    await this.search();
  }

  setQuery(query: string): Promise<void> {
    this.state.query = query;
    this.state.page = 1;
    this.notify();
    return this.search();
  }

  setQueryDebounced(query: string): void {
    this.state.query = query;
    this.state.page = 1;
    this.notify();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search();
    }, 300);
  }

  setMonsterCrFilter(cr: string): void {
    this.state.monsterCrFilter = cr;
    this.state.page = 1;
    this.notify();
  }

  setSpellLevelFilter(level: string): void {
    this.state.spellLevelFilter = level;
    this.state.page = 1;
    this.notify();
  }

  async search(): Promise<void> {
    this.state.loading = true;
    this.state.error = null;
    this.notify();

    try {
      let results: Open5eItem[] = [];
      if (this.state.tab === "monsters") {
        const filters = this.state.monsterCrFilter
          ? { challenge_rating_decimal: this.state.monsterCrFilter }
          : undefined;
        results = await searchMonsters(this.state.query, filters);
      } else if (this.state.tab === "spells") {
        const filters = this.state.spellLevelFilter
          ? { level: this.state.spellLevelFilter }
          : undefined;
        results = await searchSpells(this.state.query, filters);
      } else if (this.state.tab === "equipment") {
        results = await searchEquipment(this.state.query);
      } else {
        results = await searchMagicItems(this.state.query);
      }
      this.state.results = results;
      this.state.totalPages = Math.max(
        1,
        Math.ceil(results.length / this.state.pageSize)
      );
    } catch (err: unknown) {
      this.state.error = err instanceof Error ? err.message : "Unknown error";
      this.state.results = [];
      this.state.totalPages = 1;
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }

  getPaginatedResults(): Open5eItem[] {
    const start = (this.state.page - 1) * this.state.pageSize;
    const end = start + this.state.pageSize;
    return this.state.results.slice(start, end);
  }

  nextPage(): void {
    if (this.state.page < this.state.totalPages) {
      this.state.page++;
      this.notify();
    }
  }

  prevPage(): void {
    if (this.state.page > 1) {
      this.state.page--;
      this.notify();
    }
  }

  async selectItem(key: string): Promise<void> {
    this.state.loading = true;
    this.notify();
    try {
      if (this.state.tab === "monsters") {
        this.state.selectedItem = await getMonster(key);
      } else if (this.state.tab === "spells") {
        this.state.selectedItem = await getSpell(key);
      } else if (this.state.tab === "equipment") {
        this.state.selectedItem = await getEquipmentItem(key);
      } else {
        this.state.selectedItem = await getMagicItem(key);
      }
    } catch (err: unknown) {
      this.state.error = err instanceof Error ? err.message : "Failed to load details";
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }

  clearSelectedItem(): void {
    this.state.selectedItem = null;
    this.notify();
  }

  static formatCr(cr: string): string {
    const crMap: Record<string, string> = {
      "0.125": "1/8",
      "0.25": "1/4",
      "0.5": "1/2",
      "1.00": "1",
      "2.00": "2",
      "3.00": "3",
      "5.00": "5",
      "10.00": "10",
      "15.00": "15",
      "20.00": "20",
      "30.00": "30",
    };
    return crMap[cr] ?? String(parseFloat(cr));
  }

  static formatSpellLevel(level: number): string {
    if (level === 0) return "Заговор";
    return `${level}-й уровень`;
  }
}
