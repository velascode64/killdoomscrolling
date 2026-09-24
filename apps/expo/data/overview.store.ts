import dayjs from "dayjs";
import { makeAutoObservable } from "mobx";
import { getRewardBlockerStatistics, getRewardBlockerStatus } from "expo-app-blocker";
import { Platform } from "react-native";

import { AppStatisticsStore } from "./app.statistics";
import type { App, IAvailableApp } from "./apps.store";
import { AppsStore } from "./apps.store";

class OverviewStoreSingleton {
  private appStatisticsStore = new AppStatisticsStore();

  private appsStore = new AppsStore();

  private nativeFocusedSeconds = 0;
  private nativeBlockedAttempts = 0;
  private nativeRedirections = 0;

  constructor() {
    makeAutoObservable(this);
  }

  public async init() {
    await Promise.all([this.appsStore.init(), this.appStatisticsStore.init()]);
    if (Platform.OS === "android") {
      const statistics = getRewardBlockerStatistics();
      this.nativeFocusedSeconds = statistics.reduce((sum, item) => sum + item.productiveSeconds, 0);
      this.nativeBlockedAttempts = statistics.reduce((sum, item) => sum + item.blockedAttempts, 0);
      this.nativeRedirections = statistics.reduce((sum, item) => sum + item.redirections, 0);
      if (statistics.length === 0) this.nativeFocusedSeconds = getRewardBlockerStatus().totalProductiveSeconds;
    }
  }

  public async importNativeIntercepts(events: { appId: string; timestamp: number }[]) {
    await this.appStatisticsStore.importNativeIntercepts(events);
  }

  public get availableApps() {
    return this.appsStore.availableApps;
  }

  public openApp = (key: IAvailableApp["key"]) => {
    return this.appsStore.openApp(key);
  };

  get totalInterrupted(): number {
    return this.appStatisticsStore.getEvents({ type: "break-start" }).length;
  }

  get totalPrevented(): number {
    return this.appStatisticsStore.getEvents({ type: "app-close" }).length;
  }

  get blockedAttempts(): number {
    return Platform.OS === "android" ? this.nativeBlockedAttempts : this.totalPrevented;
  }

  get focusedMinutes(): number {
    return Math.floor(this.nativeFocusedSeconds / 60);
  }

  get localStatsDebug(): string {
    const events = this.appStatisticsStore.events;
    return `local events: ${events.length} · blocked: ${this.nativeBlockedAttempts} · redirected: ${this.nativeRedirections} · replacement: ${this.nativeFocusedSeconds}s (${this.focusedMinutes} min)`;
  }

  get totalPreventedInPercentage(): number {
    const totalInterrupted = this.totalInterrupted;
    const totalPrevented = this.totalPrevented;
    if (totalInterrupted === 0) {
      return 0;
    }
    const percentage = Math.min(100, Math.round((totalPrevented / totalInterrupted) * 100));
    return Math.max(0, percentage);
  }

  public interruptionsByDay(
    app: App,
    timeRange = {
      from: 0,
      to: 0,
    }
  ): { value: number; dateUnix: number }[] {
    const events = this.appStatisticsStore.getEvents({ type: "break-start", appId: app.id, timeRange });
    const eventsByDay = events.reduce(
      (acc, event) => {
        const day = dayjs(event.timestamp).startOf("day").valueOf();
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day] += 1;
        return acc;
      },
      {} as Record<number, number>
    );
    const eventsByDayArray = Object.entries(eventsByDay).map(([dateUnix, value]) => ({
      value,
      dateUnix: Number(dateUnix),
    }));
    return eventsByDayArray;
  }

  public preventionsByDay(
    app: App,
    timeRange = {
      from: 0,
      to: 0,
    }
  ): { value: number; dateUnix: number }[] {
    const events = this.appStatisticsStore.getEvents({ type: "app-close", appId: app.id, timeRange });
    const eventsByDay = events.reduce(
      (acc, event) => {
        const day = dayjs(event.timestamp).startOf("day").valueOf();
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day] += 1;
        return acc;
      },
      {} as Record<number, number>
    );
    const eventsByDayArray = Object.entries(eventsByDay).map(([dateUnix, value]) => ({
      value,
      dateUnix: Number(dateUnix),
    }));
    return eventsByDayArray;
  }

  public interruptionsSplitUpByAppInPercentage() {
    const apps = this.appsStore.apps;
    const totalInterrupted = this.totalInterrupted;
    const splitUp = apps.map((app) => ({
      app,
      percentage: Math.round((this.interruptionByApp(app) / totalInterrupted) * 100),
    }));
    return splitUp;
  }

  public interruptionByApp(
    app: App,
    timeRange = {
      from: 0,
      to: 0,
    }
  ): number {
    return this.appStatisticsStore.getEvents({ type: "break-start", appId: app.id, timeRange }).length;
  }

  public preventedByApp(
    app: App,
    timeRange = {
      from: 0,
      to: 0,
    }
  ): number {
    const preventedByApp = this.appStatisticsStore.getEvents({ type: "app-close", appId: app.id, timeRange }).length;
    return preventedByApp;
  }

  public preventedByAppInPercentage(
    app: App,
    timeRange = {
      from: 0,
      to: 0,
    }
  ): number {
    const interruptedByApp = this.interruptionByApp(app, timeRange);
    const preventedByApp = this.preventedByApp(app, timeRange);
    if (interruptedByApp === 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((preventedByApp / interruptedByApp) * 100)));
  }

  public hoursSavedByApp(
    app: App,
    timeRange = {
      from: 0,
      to: 0,
    }
  ): number {
    const preventedByApp = this.preventedByApp(app, timeRange);
    const dailyTimeSpentMinutes =
      this.appsStore.apps.find((a) => a.id === app.id)?.settings?.dailyTimeSpentMinutes ?? 0;
    const minutesSaved = preventedByApp * dailyTimeSpentMinutes;
    const hoursSavedByApp = minutesSaved / 60;
    return Math.round(hoursSavedByApp * 100) / 100;
  }

  public hoursSaved(
    timeRange = {
      from: 0,
      to: 0,
    }
  ): number {
    const apps = this.appsStore.apps;
    const hoursSaved = apps.reduce((sum, app) => sum + this.hoursSavedByApp(app, timeRange), 0);
    return Math.round(hoursSaved * 100) / 100;
  }
  get stillCollectingData(): boolean {
    if (this.appStatisticsStore.events.length === 0) {
      return true;
    }
    const firstEvent = this.appStatisticsStore.events[0];
    if (!firstEvent) {
      return true;
    }
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;
    return now - firstEvent.timestamp < oneDay && this.totalInterrupted < 10;
  }

  get apps(): App[] {
    return this.appsStore.apps;
  }
}

export const OverviewStore = new OverviewStoreSingleton();
