// 天気データの型定義
export interface WeatherData {
  date: string;
  icon: string;
  description: string;
  temp: number;
  humidity: number;
}

// Open-Meteo API設定
const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1';

// 天気アイコンマッピング（Open-Meteo用）
const WEATHER_ICONS: { [key: string]: string } = {
  '0': 'Sun',        // 晴れ
  '1': 'Cloud',      // 主に晴れ
  '2': 'Cloud',      // 部分的に曇り
  '3': 'Cloud',      // 曇り
  '45': 'CloudFog',  // 霧
  '48': 'CloudFog',  // 霧（着氷）
  '51': 'CloudRain', // 軽い霧雨
  '53': 'CloudRain', // 霧雨
  '55': 'CloudRain', // 強い霧雨
  '56': 'CloudRain', // 軽い着氷霧雨
  '57': 'CloudRain', // 着氷霧雨
  '61': 'CloudRain', // 小雨
  '63': 'CloudRain', // 雨
  '65': 'CloudRain', // 大雨
  '66': 'CloudRain', // 軽い着氷雨
  '67': 'CloudRain', // 着氷雨
  '71': 'Snowflake', // 小雪
  '73': 'Snowflake', // 雪
  '75': 'Snowflake', // 大雪
  '77': 'Snowflake', // 細かい雪
  '80': 'CloudRain', // 軽いにわか雨
  '81': 'CloudRain', // にわか雨
  '82': 'CloudRain', // 強いにわか雨
  '85': 'Snowflake', // 軽いにわか雪
  '86': 'Snowflake', // にわか雪
  '95': 'Zap',       // 雷雨
  '96': 'Zap',       // 雷雨（雹）
  '99': 'Zap',       // 強い雷雨（雹）
};

// キャッシュ管理
const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const weatherCache = new Map<string, { data: WeatherData[]; timestamp: number }>();

// APIキーの読み込み確認（Open-MeteoはAPIキー不要）
console.log('weatherService初期化:', {
  apiKey: '不要（Open-Meteo）',
  baseUrl: OPENMETEO_BASE_URL,
  envVar: 'Open-Meteo API'
});

// 郵便番号から座標を取得（Open-Meteo用）
const getCoordinatesFromZipcode = async (zipcode: string): Promise<{ lat: number; lon: number }> => {
  try {
    // Open-Meteoは郵便番号を直接使用できないため、座標変換が必要
    // 簡易的な座標変換（実際の実装ではより正確な変換が必要）
    console.log('郵便番号から座標変換（Open-Meteo）:', zipcode);
    
    // 日本の主要都市の座標マッピング（簡易版）
    const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
      '1000001': { lat: 35.6762, lon: 139.6503 }, // 東京
      '5300001': { lat: 34.7024, lon: 135.4959 }, // 大阪
      '4600001': { lat: 35.1815, lon: 136.9066 }, // 名古屋
      '6500001': { lat: 34.6901, lon: 135.1955 }, // 神戸
      '9800001': { lat: 38.2688, lon: 140.8721 }, // 仙台
      '8100001': { lat: 33.5902, lon: 130.4017 }, // 福岡
      '0600001': { lat: 43.0618, lon: 141.3545 }, // 札幌
      '7000001': { lat: 34.3853, lon: 132.4553 }, // 広島
    };
    
    // 郵便番号の上3桁で都市を判定
    const prefix = zipcode.substring(0, 3);
    const cityMap: { [key: string]: string } = {
      '100': '1000001', // 東京
      '530': '5300001', // 大阪
      '460': '4600001', // 名古屋
      '650': '6500001', // 神戸
      '980': '9800001', // 仙台
      '810': '8100001', // 福岡
      '060': '0600001', // 札幌
      '700': '7000001', // 広島
    };
    
    const mappedZipcode = cityMap[prefix] || '1000001'; // デフォルトは東京
    const coords = cityCoordinates[mappedZipcode];
    
    console.log('座標変換結果:', { zipcode, mappedZipcode, coords });
    return coords;
  } catch (error) {
    console.error('座標取得エラー:', error);
    // デフォルト座標（東京）
    return { lat: 35.6762, lon: 139.6503 };
  }
};

// 天気予報を取得（Open-Meteo）
const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherData[]> => {
  try {
    const response = await fetch(
      `${OPENMETEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo`
    );
    const data = await response.json();
    
    console.log('Open-Meteo レスポンス:', data);
    
    if (data.daily && data.daily.time) {
      return data.daily.time.map((date: string, index: number) => ({
        date: date, // YYYY-MM-DD形式
        icon: data.daily.weather_code[index].toString(), // 天気コード
        description: getWeatherDescription(data.daily.weather_code[index]), // 天気説明
        temp: Math.round((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2), // 平均気温
        humidity: 60, // Open-Meteoは湿度を提供しないため、デフォルト値
      }));
    } else {
      throw new Error('天気データを取得できませんでした');
    }
  } catch (error) {
    console.error('天気予報取得エラー:', error);
    throw error;
  }
};

// 天気コードから説明を取得
const getWeatherDescription = (code: number): string => {
  const descriptions: { [key: string]: string } = {
    '0': '晴れ',
    '1': '主に晴れ',
    '2': '部分的に曇り',
    '3': '曇り',
    '45': '霧',
    '48': '霧（着氷）',
    '51': '軽い霧雨',
    '53': '霧雨',
    '55': '強い霧雨',
    '56': '軽い着氷霧雨',
    '57': '着氷霧雨',
    '61': '小雨',
    '63': '雨',
    '65': '大雨',
    '66': '軽い着氷雨',
    '67': '着氷雨',
    '71': '小雪',
    '73': '雪',
    '75': '大雪',
    '77': '細かい雪',
    '80': '軽いにわか雨',
    '81': 'にわか雨',
    '82': '強いにわか雨',
    '85': '軽いにわか雪',
    '86': 'にわか雪',
    '95': '雷雨',
    '96': '雷雨（雹）',
    '99': '強い雷雨（雹）',
  };
  
  return descriptions[code.toString()] || '不明';
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

// APIキーのテスト関数（Open-MeteoはAPIキー不要）
export const testWeatherAPI = async (): Promise<void> => {
  console.log('=== Open-Meteo APIテスト開始 ===');
  console.log('APIキー: 不要（Open-Meteo）');
  console.log('ベースURL:', OPENMETEO_BASE_URL);
  
  try {
    // 東京の座標でテスト
    const testResponse = await fetch(
      `${OPENMETEO_BASE_URL}/forecast?latitude=35.6762&longitude=139.6503&daily=weather_code,temperature_2m_max&timezone=Asia%2FTokyo`
    );
    const testData = await testResponse.json();
    console.log('Open-Meteo APIテスト結果:', testData);
  } catch (error) {
    console.error('Open-Meteo APIテストエラー:', error);
  }
};

// メイン関数：郵便番号から天気予報を取得
export const getWeatherByZipcode = async (zipcode: string): Promise<WeatherData[]> => {
  console.log('getWeatherByZipcode開始:', zipcode, 'API: Open-Meteo');
  
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
    console.log('取得したデータの最初の3件:', weatherData.slice(0, 3));
    
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
  console.log('getWeatherForDate検索:', date, '利用可能な日付:', weatherData.map(w => w.date).slice(0, 5));
  const result = weatherData.find(weather => weather.date === date) || null;
  console.log('getWeatherForDate結果:', result);
  return result;
};
