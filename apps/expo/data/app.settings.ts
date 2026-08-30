import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAllBlocks, clearRewardBlocker, stopMonitoring } from "expo-app-blocker";
import { makeAutoObservable } from "mobx";

import { AppStatisticsStore } from "./app.statistics";
import type { App } from "./apps.store";
import { AppsStore } from "./apps.store";
import { ShortCutPayload } from "./shortcut.payload";
import { supabase } from "./supabase";

export class AppSettingsSingleton {
  private appsStore = new AppsStore();

  private appStatisticStore = new AppStatisticsStore();

  constructor() {
    makeAutoObservable(this);
  }
  public async init() {
    await this.appsStore.init();
  }
  public async updateAppSettings(appUpdate: {
    active?: boolean;
    settings?: App["settings"];
    id: string;
  }): Promise<void> {
    await this.appsStore.updateApp({
      id: appUpdate.id,
      active: appUpdate.active,
      settings: appUpdate.settings,
    });
  }

  public deleteApp = async (appId: string): Promise<void> => {
    await this.appsStore.deleteApp(appId);
    await this.appStatisticStore.deleteEventsByAppId(appId);
  };

  public dangerouslyDeleteAllData = async (): Promise<void> => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    // A profile delete cascades to onboarding, modes, sessions and product events.
    if (data.session?.user.id) {
      const { error } = await supabase.from("profiles").delete().eq("id", data.session.user.id);
      if (error) throw error;
    }

    clearRewardBlocker();
    clearAllBlocks();
    stopMonitoring();
    await this.appsStore.deleteAll();
    await this.appStatisticStore.deleteAll();
    await ShortCutPayload.clear();
    await supabase.auth.signOut({ scope: "local" });
    await AsyncStorage.clear();
  };

  get apps(): App[] {
    return this.appsStore.apps;
  }

  public getIconUrl = (iconKey: string): string => {
    return this.appsStore.getIconUrl(iconKey);
  };
}

export const AppSettings = new AppSettingsSingleton();
