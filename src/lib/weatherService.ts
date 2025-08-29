// 天気データの型定義
export interface WeatherData {
  date: string;
  icon: string;
  description: string;
  temp: number;
  humidity: number;
}

// OpenWeatherMap API設定
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 天気アイコンマッピング
const WEATHER_ICONS: { [key: string]: string } = {
  '01d': 'Sun',        // 晴れ
  '01n': 'Moon',       // 晴れ（夜）
  '02d': 'Cloud',      // 曇り
  '02n': 'Cloud',      // 曇り（夜）
  '03d': 'Cloud',      // 曇り
  '04d': 'Clouds',     // 曇り
  '09d': 'CloudRain',  // 小雨
  '10d': 'CloudRain',  // 雨
  '11d': 'Zap',        // 雷
  '13d': 'Snowflake',  // 雪
  '50d': 'CloudFog',   // 霧
};

// キャッシュ管理
const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const weatherCache = new Map<string, { data: WeatherData[]; timestamp: number }>();

// 郵便番号から座標を取得
const getCoordinatesFromZipcode = async (zipcode: string): Promise<{ lat: number; lon: number }> => {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/zip?zip=${zipcode},JP&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();
    
    if (data.lat && data.lon) {
      return { lat: data.lat, lon: data.lon };
    } else {
      throw new Error('座標を取得できませんでした');
    }
  } catch (error) {
    console.error('座標取得エラー:', error);
    throw error;
  }
};

// 天気予報を取得
const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherData[]> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`
    );
    const data = await response.json();
    
    if (data.list) {
      return data.list.map((item: { dt_txt: string; weather: Array<{ icon: string; description: string }>; main: { temp: number; humidity: number } }) => ({
        date: item.dt_txt.split(' ')[0], // YYYY-MM-DD形式
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        temp: Math.round(item.main.temp),
        humidity: item.main.humidity,
      }));
    } else {
      throw new Error('天気データを取得できませんでした');
    }
  } catch (error) {
    console.error('天気予報取得エラー:', error);
    throw error;
  }
};

// キャッシュから天気データを取得
const getCachedWeather = (cacheKey: string): WeatherData[] | null => {
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// 天気データをキャッシュに保存
const setCachedWeather = (cacheKey: string, data: WeatherData[]): void => {
  weatherCache.set(cacheKey, { data, timestamp: Date.now() });
};

// メイン関数：郵便番号から天気予報を取得
export const getWeatherByZipcode = async (zipcode: string): Promise<WeatherData[]> => {
  console.log('getWeatherByZipcode開始:', zipcode, 'APIキー:', OPENWEATHER_API_KEY ? '設定済み' : '未設定');
  
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap APIキーが設定されていません');
    return [];
  }

  const cacheKey = `weather_${zipcode}`;
  
  // キャッシュから取得を試行
  const cachedData = getCachedWeather(cacheKey);
  if (cachedData) {
    console.log('キャッシュから天気データを取得:', zipcode);
    return cachedData;
  }

  try {
    console.log('天気データを取得中:', zipcode);
    
    // 座標を取得
    console.log('座標取得開始:', zipcode);
    const coords = await getCoordinatesFromZipcode(zipcode);
    console.log('座標取得完了:', coords);
    
    // 天気予報を取得
    console.log('天気予報取得開始:', coords);
    const weatherData = await getWeatherForecast(coords.lat, coords.lon);
    console.log('天気予報取得完了:', weatherData.length, '件');
    
    // キャッシュに保存
    setCachedWeather(cacheKey, weatherData);
    
    console.log('天気データを取得しました:', weatherData.length, '件');
    return weatherData;
  } catch (error) {
    console.error('天気データ取得に失敗:', error);
    return [];
  }
};

// 天気アイコンを取得
export const getWeatherIcon = (iconCode: string): string => {
  return WEATHER_ICONS[iconCode] || 'Cloud';
};

// 特定の日付の天気データを取得
export const getWeatherForDate = (weatherData: WeatherData[], date: string): WeatherData | null => {
  return weatherData.find(weather => weather.date === date) || null;
};
