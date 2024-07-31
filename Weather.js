import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, StyleSheet, ActivityIndicator, FlatList,
    Pressable, ImageBackground, SafeAreaView, Keyboard, TouchableOpacity, StatusBar,
    ScrollView,
    Platform
} from 'react-native';

import axios from 'axios';
import debounce from 'lodash.debounce';

import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

import blank from './assets/blank.png'
import rainPic from './assets/rain.gif'
import thunderPic from './assets/thunder.gif'

import { BlurView } from 'expo-blur';

const Weather = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [background, setBackground] = useState(blank);

    const fetchSuggestions = async (inputValue) => {
        if (inputValue.trim() === '') {
            setSuggestions([]);
            return;
        }

        try {
            const url = `https://weatherapi-com.p.rapidapi.com/search.json?q=${inputValue}`;
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '72d949d974msh3127b927519e7d0p1bfb7djsn6c36e0cda251',
                    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
                }
            };
            const response = await axios.get(url, options);
            setSuggestions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 500), []);

    const fetchWeather = async () => {
        if (!selectedLocation) return;
        setLoading(true);
        try {
            const { lat, lon } = selectedLocation;
            const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${lat}%2C${lon}&days=2`;
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '72d949d974msh3127b927519e7d0p1bfb7djsn6c36e0cda251',
                    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
                }
            };
            const response = await axios.get(url, options);
            setWeather(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionPress = (suggestion) => {
        Keyboard.dismiss();
        setSelectedLocation({ lat: suggestion.lat, lon: suggestion.lon });
        setCity(`${suggestion.name}, ${suggestion.region}, ${suggestion.country}`);
        setSuggestions([]);
    };

    const dynamicBackground = () => {
        if (weather && weather.current)
            if (weather.current.condition.text.toLowerCase().includes('sunny') || weather.current.condition.text.toLowerCase().includes('clear')) {
                setBackground(sky);
            } else if (weather.current.condition.text.toLowerCase().includes('rain') || weather.current.condition.text.toLowerCase().includes('mist') || weather.current.condition.text.toLowerCase().includes('cloud')) {
                setBackground(rainPic);
            } else if (weather.current.condition.text.toLowerCase().includes('thunder') || weather.current.condition.text.toLowerCase().includes('storm')) {
                setBackground(thunderPic);
            } else {
                setBackground(blank);
            }
    };

    useEffect(() => { fetchWeather(); }, [selectedLocation]);
    useEffect(() => { dynamicBackground(); }, [weather]);

    return (
        <View style={styles.container}>
            <ImageBackground style={{ flex: 1, padding: 2 }} source={background}>
                <SafeAreaView style={{ position: 'relative', flex: 1, zIndex: 0, marginHorizontal: 5 }}>
                    <StatusBar style={styles.statusbar} />
                    <View style={styles.inputContainer}>
                        <BlurView
                            experimentalBlurMethod='dimezisBlurView' intensity={60} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                overflow: 'hidden',
                                width: '100%',
                                borderRadius: 20,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                paddingHorizontal: 7
                            }}>
                            <TextInput
                                style={styles.input}
                                placeholder="Search Location..."
                                placeholderTextColor={'white'}
                                value={city}
                                onChangeText={(text) => {
                                    setCity(text);
                                    debouncedFetchSuggestions(text);
                                }}
                            />
                            {city.length > 0 ? (
                                <Pressable style={{ padding: 7 }} onPress={() => {
                                    setCity('');
                                    setSuggestions([]);
                                }}>
                                    <Entypo name="cross" size={20} color="white" />
                                </Pressable>
                            ) : (
                                <AntDesign name="search1" size={20} color="white" />
                            )}
                        </BlurView>
                    </View>
                    {suggestions.length > 0 && (
                        <BlurView experimentalBlurMethod='dimezisBlurView' intensity={45} style={styles.suggestionsContainer}>
                            <FlatList
                                style={{ backgroundColor: 'transparent' }}
                                data={suggestions}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={{ padding: 5 }} onPress={() => handleSuggestionPress(item)}>
                                        <View style={{
                                            backgroundColor: 'transparent',
                                            borderBottomWidth: 1,
                                            borderColor: 'lightgrey',
                                            padding: 3,
                                            marginHorizontal: 5,
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}>
                                            <Entypo name="location" size={20} color="white" />
                                            <Text style={styles.suggestionItem}>{item.name}, {item.region}, {item.country}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </BlurView>
                    )}
                    {
                        loading && <ActivityIndicator size="large" color="#0000ff" />
                    }
                    {weather ? (
                        <ScrollView overScrollMode='never' showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: "100%", justifyContent: 'space-evenly' }} >
                            <BlurView experimentalBlurMethod='dimezisBlurView' intensity={20} style={{
                                overflow: 'hidden',
                                borderRadius: 20,
                                paddingVertical: '5%',
                                backgroundColor: 'rgba(255,255,255, 0.1)'

                            }} >
                                <View style={styles.weatherContainer}>
                                    <Text style={styles.cityName}>{weather.location.name}</Text>
                                    <Text style={styles.temperature}>{weather.current.temp_c}°</Text>
                                    <Text style={styles.description}>{weather.current.condition.text}</Text>
                                </View>
                            </BlurView>
                            <BlurView
                                experimentalBlurMethod='dimezisBlurView' intensity={20} style={{
                                    overflow: 'hidden',
                                    borderRadius: 20,
                                    paddingVertical: '4%',
                                    paddingHorizontal: 10,
                                    backgroundColor: 'rgba(255,255,255, 0.1)',
                                }}
                            >
                                <View style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: 'lightgrey',
                                    marginBottom: '3%',
                                    marginHorizontal: 10

                                }}>
                                    <Text style={styles.hourlyTitle}>24-Hour Forecast</Text>
                                </View>
                                <ScrollView overScrollMode='never' horizontal showsHorizontalScrollIndicator={false}
                                >
                                    <View style={styles.hourlyContainer}>
                                        {weather.forecast.forecastday[0].hour.map((hour, index) => (
                                            <View key={index} style={styles.hourlyItem}>
                                                <Text style={styles.white}>{new Date(hour.time).getHours()}:00</Text>
                                                <Text style={styles.white}>{Math.floor(hour.temp_c)}°</Text>
                                                <Text style={styles.white}>{hour.condition.text}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </BlurView>
                            <BlurView
                                experimentalBlurMethod='dimezisBlurView' intensity={20} style={{
                                    overflow: 'hidden',
                                    borderRadius: 20,
                                    paddingVertical: '7%',
                                    paddingHorizontal: 10,
                                    backgroundColor: 'rgba(255,255,255, 0.1)',
                                }}
                            >
                                <View style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: 'lightgrey',
                                    marginBottom: '3%',
                                    marginHorizontal: 10

                                }}>
                                    <Text style={styles.hourlyTitle}>Tomorrow's 24-Hour Forecast</Text>
                                </View>
                                <ScrollView overScrollMode='never' horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.hourlyContainer}>
                                        {weather.forecast.forecastday[1].hour.map((hour, index) => (
                                            <View key={index} style={styles.hourlyItem}>
                                                <Text style={styles.white}>{new Date(hour.time).getHours()}:00</Text>
                                                <Text style={styles.white}>{hour.temp_c}°</Text>
                                                <Text style={styles.white}>{hour.condition.text}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </BlurView>
                        </ScrollView>
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{
                                color: "white", fontWeight: '600'
                            }}>Search a location to get weather updates.</Text>
                            <Text style={{
                                color: "white", fontWeight: '600'
                            }}>You can also save a location.</Text>
                        </View>
                    )}
                </SafeAreaView>
            </ImageBackground>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        color: 'white',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 1,
        paddingVertical: 10,
        zIndex: 2,
        fontSize: 17,
        flex: 1,
    },
    inputContainer: {
        marginTop: 5,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 5,
        zIndex: 21,
        height: 40,
    },
    suggestionsContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        top:
            Platform.OS === 'ios' ? '12%' : '12%',
        position: 'absolute',
        margin: 'auto',
        width: '100%',
        zIndex: 2,
        borderRadius: 10,
        elevation: 10,
        maxHeight:
            Platform.OD === 'ios' ? '50%'
                : '100%'
    },
    suggestionItem: {
        fontSize: 15,
        padding: 10,
        width: '100%',
        color: 'white',
        fontWeight: '600'
    },
    weatherContainer: {
        alignItems: 'center',
        marginVertical: 20,
        textAlign: 'center'
    },
    cityName: {
        fontSize: 30,
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'transparent'

    },
    temperature: {
        fontSize: 55,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'white',
        textAlign: 'center',


    },
    description: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
    },
    hourlyTitle: {
        fontSize: 15,
        color: 'lightgrey',
    },
    hourlyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hourlyItem: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    white: {
        color: 'white',
        fontSize: 16,
        marginVertical: 2
    }

});

export default Weather;
