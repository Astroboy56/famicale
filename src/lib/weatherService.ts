// 天気データの型定義
export interface WeatherData {
  date: string;
  icon: string;
  description: string;
  temp: number;
  humidity: number;
}

// WeatherAPI.com API設定
const WEATHERAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
const WEATHERAPI_BASE_URL = 'https://api.weatherapi.com/v1';

// 天気アイコンマッピング（WeatherAPI.com用）
const WEATHER_ICONS: { [key: string]: string } = {
  '113': 'Sun',        // 晴れ
  '116': 'Cloud',      // 曇り
  '119': 'Cloud',      // 曇り
  '122': 'Clouds',     // 曇り
  '143': 'CloudFog',   // 霧
  '176': 'CloudRain',  // 小雨
  '179': 'CloudRain',  // 雨
  '182': 'CloudRain',  // 雨
  '185': 'CloudRain',  // 雨
  '200': 'Zap',        // 雷
  '227': 'Snowflake',  // 雪
  '230': 'Snowflake',  // 雪
  '248': 'CloudFog',   // 霧
  '260': 'CloudFog',   // 霧
  '263': 'CloudRain',  // 小雨
  '266': 'CloudRain',  // 小雨
  '281': 'CloudRain',  // 雨
  '284': 'CloudRain',  // 雨
  '293': 'CloudRain',  // 小雨
  '296': 'CloudRain',  // 雨
  '299': 'CloudRain',  // 雨
  '302': 'CloudRain',  // 雨
  '305': 'CloudRain',  // 雨
  '308': 'CloudRain',  // 雨
  '311': 'CloudRain',  // 小雨
  '314': 'CloudRain',  // 雨
  '317': 'CloudRain',  // 雨
  '320': 'Snowflake',  // 雪
  '323': 'Snowflake',  // 雪
  '326': 'Snowflake',  // 雪
  '329': 'Snowflake',  // 雪
  '332': 'Snowflake',  // 雪
  '335': 'Snowflake',  // 雪
  '338': 'Snowflake',  // 雪
  '350': 'CloudRain',  // 雨
  '353': 'CloudRain',  // 小雨
  '356': 'CloudRain',  // 雨
  '359': 'CloudRain',  // 雨
  '362': 'CloudRain',  // 雨
  '365': 'CloudRain',  // 雨
  '368': 'CloudRain',  // 雨
  '371': 'Snowflake',  // 雪
  '374': 'CloudRain',  // 雨
  '377': 'CloudRain',  // 雨
  '386': 'Zap',        // 雷
  '389': 'Zap',        // 雷
  '392': 'Zap',        // 雷
  '395': 'Zap',        // 雷
};

// キャッシュ管理
const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const weatherCache = new Map<string, { data: WeatherData[]; timestamp: number }>();

// APIキーの読み込み確認
console.log('weatherService初期化:', {
  apiKey: WEATHERAPI_KEY ? '設定済み' : '未設定',
  apiKeyLength: WEATHERAPI_KEY?.length,
  envVar: process.env.NEXT_PUBLIC_WEATHERAPI_KEY ? '存在' : '不存在'
});

// 郵便番号から座標を取得（WeatherAPI.comは郵便番号を直接使用可能）
const getCoordinatesFromZipcode = async (zipcode: string): Promise<{ lat: number; lon: number }> => {
  try {
    // WeatherAPI.comは郵便番号を直接使用できるため、デフォルト座標を返す
    // 実際の座標は天気予報取得時に自動的に解決される
    console.log('郵便番号から座標変換（WeatherAPI.com）:', zipcode);
    return { lat: 35.6762, lon: 139.6503 }; // デフォルト座標（東京）
  } catch (error) {
    console.error('座標取得エラー:', error);
    throw error;
  }
};

// 天気予報を取得（WeatherAPI.com）
const getWeatherForecast = async (zipcode: string): Promise<WeatherData[]> => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${zipcode}&days=30&lang=ja`
    );
    const data = await response.json();
    
    console.log('WeatherAPI.com レスポンス:', data);
    
    if (data.forecast && data.forecast.forecastday) {
      return data.forecast.forecastday.map((day: { date: string; day: { condition: { code: number; text: string }; avgtemp_c: number; avghumidity: number } }) => ({
        date: day.date, // YYYY-MM-DD形式
        icon: day.day.condition.code.toString(), // 天気コード
        description: day.day.condition.text, // 天気説明
        temp: Math.round(day.day.avgtemp_c), // 平均気温
        humidity: day.day.avghumidity, // 平均湿度
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

// APIキーのテスト関数
export const testWeatherAPI = async (): Promise<void> => {
  console.log('=== WeatherAPI.com APIテスト開始 ===');
  console.log('APIキー:', WEATHERAPI_KEY);
  console.log('APIキー長さ:', WEATHERAPI_KEY?.length);
  
  if (!WEATHERAPI_KEY) {
    console.error('WeatherAPI.com APIキーが設定されていません');
    return;
  }
  
  try {
    // 東京の郵便番号でテスト
    const testResponse = await fetch(
      `${WEATHERAPI_BASE_URL}/current.json?key=${WEATHERAPI_KEY}&q=1000001&lang=ja`
    );
    const testData = await testResponse.json();
    console.log('WeatherAPI.com APIテスト結果:', testData);
  } catch (error) {
    console.error('WeatherAPI.com APIテストエラー:', error);
  }
};

// メイン関数：郵便番号から天気予報を取得
export const getWeatherByZipcode = async (zipcode: string): Promise<WeatherData[]> => {
  console.log('getWeatherByZipcode開始:', zipcode, 'APIキー:', WEATHERAPI_KEY ? '設定済み' : '未設定');
  
  if (!WEATHERAPI_KEY) {
    console.warn('WeatherAPI.com APIキーが設定されていません');
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
    
    // 座標を取得（WeatherAPI.comは郵便番号を直接使用）
    console.log('座標取得開始:', zipcode);
    const coords = await getCoordinatesFromZipcode(zipcode);
    console.log('座標取得完了:', coords);
    
    // 天気予報を取得
    console.log('天気予報取得開始:', zipcode);
    const weatherData = await getWeatherForecast(zipcode);
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
