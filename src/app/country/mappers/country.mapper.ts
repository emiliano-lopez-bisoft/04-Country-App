import { Country } from '../interfaces/country.interface';
import { CountryData } from '../interfaces/rest-countries.interfaces';

export class CountryMapper {
  static mapRestCountryToCountry(restCountry: CountryData): Country {
    const primaryCapital = restCountry.capitals.find((capital) => capital.attributes.primary);

    return {
      cca2: restCountry.codes.alpha_2,
      flag: restCountry.flag.emoji,
      flagSvg: restCountry.flag.url_svg,
      name: restCountry.names.translations['spa'].common ?? 'No Spanish Name',
      capital: primaryCapital?.name ?? '',
      population: restCountry.population,
      region: restCountry.region,
      subRegion: restCountry.subregion,
    };
  }

  static mapRestCountryToCountryArray(restCountries: CountryData[]): Country[] {
    return restCountries.map(this.mapRestCountryToCountry);
  }
}
