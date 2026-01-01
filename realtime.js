// ============================================
// ⚡ REALTIME UPDATES
// ============================================
// تحديثات مباشرة للوحة المتصدرين والإشعارات

import { supabase } from './supabase-config.js';

// 🎯 قنوات الاشتراك النشطة
const activeChannels = new Map();

// 🏆 الاشتراك في تحديثات لوحة المتصدرين
export function subscribeToLeaderboard(callback) {
  const channelName = 'leaderboard-updates';
  
  // إلغاء القناة القديمة إذا كانت موجودة
  if (activeChannels.has(channelName)) {
    unsubscribe(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // استماع لجميع الأحداث (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'profiles',
        filter: 'best_score=gt.0' // فقط من لديهم نقاط
      },
      (payload) => {
        handleLeaderboardUpdate(payload, callback);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ متصل بلوحة المتصدرين المباشرة');
      }
    });

  activeChannels.set(channelName, channel);

  return () => unsubscribe(channelName);
}

// 📊 معالجة تحديثات اللوحة
function handleLeaderboardUpdate(payload, callback) {
  const { eventType, new: newRecord, old: oldRecord } = payload;

  let updateInfo = {
    type: eventType,
    player: null,
    message: '',
    isNewRecord: false
  };

  if (eventType === 'INSERT' || eventType === 'UPDATE') {
    updateInfo.player = newRecord;
    
    // التحقق من رقم قياسي جديد
    if (oldRecord && newRecord.best_score > oldRecord.best_score) {
      updateInfo.isNewRecord = true;
      updateInfo.message = `${newRecord.username} حقق رقماً قياسياً جديداً: ${newRecord.best_score} 🔥`;
    } else if (eventType === 'INSERT') {
      updateInfo.message = `لاعب جديد انضم: ${newRecord.username}`;
    }
  }

  callback(updateInfo);
}

// 👤 الاشتراك في تحديثات ملف شخصي محدد
export function subscribeToProfile(userId, callback) {
  const channelName = `profile-${userId}`;

  if (activeChannels.has(channelName)) {
    unsubscribe(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback({
          type: 'profile_updated',
          data: payload.new
        });
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => unsubscribe(channelName);
}

// 🎮 الاشتراك في الجلسات النشطة
export function subscribeToActiveSessions(callback) {
  const channelName = 'active-sessions';

  if (activeChannels.has(channelName)) {
    unsubscribe(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'game_sessions'
      },
      async (payload) => {
        // جلب معلومات اللاعب
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, country_code')
          .eq('user_id', payload.new.user_id)
          .single();

        callback({
          type: 'new_game',
          session: payload.new,
          player: profile
        });
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => unsubscribe(channelName);
}

// 🏅 الاشتراك في الإنجازات الجديدة
export function subscribeToAchievements(callback) {
  const channelName = 'achievements';

  if (activeChannels.has(channelName)) {
    unsubscribe(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements'
      },
      async (payload) => {
        // جلب تفاصيل الإنجاز
        const { data: achievement } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', payload.new.achievement_id)
          .single();

        // جلب معلومات اللاعب
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', payload.new.user_id)
          .single();

        callback({
          type: 'new_achievement',
          achievement,
          player: profile,
          unlockedAt: payload.new.unlocked_at
        });
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => unsubscribe(channelName);
}

// 📢 بث حدث مخصص (Presence)
export function createPresenceChannel(channelName, userId, metadata = {}) {
  if (activeChannels.has(channelName)) {
    unsubscribe(channelName);
  }

  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userId
      }
    }
  });

  // تتبع اللاعبين المتصلين
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('🟢 لاعبون متصلون:', Object.keys(state).length);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('✅ لاعب جديد:', key);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('❌ لاعب غادر:', key);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...metadata
        });
      }
    });

  activeChannels.set(channelName, channel);

  return {
    channel,
    getOnlinePlayers: () => {
      const state = channel.presenceState();
      return Object.values(state).flat();
    },
    updatePresence: (newMetadata) => {
      channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        ...newMetadata
      });
    },
    unsubscribe: () => unsubscribe(channelName)
  };
}

// 💬 إرسال رسالة بث
export async function broadcastMessage(channelName, message) {
  const channel = activeChannels.get(channelName);
  
  if (!channel) {
    console.error('القناة غير موجودة:', channelName);
    return false;
  }

  const { error } = await channel.send({
    type: 'broadcast',
    event: 'message',
    payload: {
      message,
      timestamp: new Date().toISOString()
    }
  });

  return !error;
}

// 📡 الاستماع لرسائل البث
export function listenToBroadcast(channelName, callback) {
  const channel = activeChannels.get(channelName);
  
  if (!channel) {
    console.error('القناة غير موجودة:', channelName);
    return;
  }

  channel.on('broadcast', { event: 'message' }, (payload) => {
    callback(payload);
  });
}

// 🔕 إلغاء الاشتراك من قناة
export function unsubscribe(channelName) {
  const channel = activeChannels.get(channelName);
  
  if (channel) {
    supabase.removeChannel(channel);
    activeChannels.delete(channelName);
    console.log('🔕 تم إلغاء الاشتراك من:', channelName);
    return true;
  }
  
  return false;
}

// 🧹 إلغاء جميع الاشتراكات
export function unsubscribeAll() {
  activeChannels.forEach((channel, channelName) => {
    supabase.removeChannel(channel);
    console.log('🔕 تم إلغاء:', channelName);
  });
  
  activeChannels.clear();
  console.log('✅ تم إلغاء جميع الاشتراكات');
}

// 📊 حالة الاتصال
export function getConnectionStatus() {
  return {
    connected: activeChannels.size > 0,
    activeChannels: Array.from(activeChannels.keys()),
    count: activeChannels.size
  };
}

// 🔄 إعادة الاتصال التلقائي
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function enableAutoReconnect(channels, callbacks) {
  window.addEventListener('online', () => {
    console.log('🌐 الاتصال بالإنترنت متاح - إعادة الاشتراك...');
    
    reconnectAttempts = 0;
    
    // إعادة الاشتراك في القنوات
    channels.forEach((channelConfig) => {
      const { name, type, callback } = channelConfig;
      
      switch (type) {
        case 'leaderboard':
          subscribeToLeaderboard(callback);
          break;
        case 'profile':
          subscribeToProfile(channelConfig.userId, callback);
          break;
        case 'sessions':
          subscribeToActiveSessions(callback);
          break;
      }
    });
  });

  window.addEventListener('offline', () => {
    console.log('📡 الاتصال مقطوع - سيتم إعادة المحاولة...');
  });
}

// 🎯 مثال استخدام شامل
export function setupRealtimeSystem(userId, callbacks = {}) {
  const unsubscribers = [];

  // لوحة المتصدرين
  if (callbacks.onLeaderboardUpdate) {
    const unsub = subscribeToLeaderboard(callbacks.onLeaderboardUpdate);
    unsubscribers.push(unsub);
  }

  // الملف الشخصي
  if (callbacks.onProfileUpdate && userId) {
    const unsub = subscribeToProfile(userId, callbacks.onProfileUpdate);
    unsubscribers.push(unsub);
  }

  // الجلسات النشطة
  if (callbacks.onNewSession) {
    const unsub = subscribeToActiveSessions(callbacks.onNewSession);
    unsubscribers.push(unsub);
  }

  // الإنجازات
  if (callbacks.onNewAchievement) {
    const unsub = subscribeToAchievements(callbacks.onNewAchievement);
    unsubscribers.push(unsub);
  }

  // إرجاع وظيفة التنظيف
  return () => {
    unsubscribers.forEach(unsub => unsub());
    console.log('🧹 تم تنظيف جميع الاشتراكات');
  };
}

// ✅ استخدام:
// import { subscribeToLeaderboard, setupRealtimeSystem } from './realtime.js';
// 
// const cleanup = setupRealtimeSystem(userId, {
//   onLeaderboardUpdate: (update) => console.log('تحديث جديد:', update),
//   onProfileUpdate: (update) => console.log('الملف محدث:', update)
// });
