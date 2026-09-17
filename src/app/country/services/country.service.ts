import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CountryData, RESTCountry } from '../interfaces/rest-countries.interfaces';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import type { Country } from '../interfaces/country.interface';
import { CountryMapper } from '../mappers/country.mapper';

const API_URL = 'https://api.restcountries.com/countries/v5';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);
  private queryCacheCapital = new Map<string, Country[]>();

  searchByCapital(query: string): Observable<Country[]> {
    query = query.toLowerCase();

    if (this.queryCacheCapital.has(query)) {
      return of(this.queryCacheCapital.get(query) ?? []);
    }

    console.log(`Llegando al servidor por ${query}`);

    return this.http
      .get<RESTCountry>(`${API_URL}/capitals`, {
        params: {
          q: query,
        },
        headers: {
          Authorization: `Bearer ${environment.apiKey}`,
        },
      })
      .pipe(
        map((resp) => CountryMapper.mapRestCountryToCountryArray(resp.data.objects)),
        tap((countries) => this.queryCacheCapital.set(query, countries)),
        catchError((error) => {
          console.log('Error fetching', error);

          return throwError(() => new Error('No se pudo obtener países con ese query'));
        }),
      );
  }

  searchByCountry(query: string): Observable<Country[]> {
    query = query.toLowerCase();

    return this.http
      .get<RESTCountry>(`${API_URL}/names.common`, {
        params: {
          q: query,
        },
        headers: {
          Authorization: `Bearer ${environment.apiKey}`,
        },
      })
      .pipe(
        map((resp) => CountryMapper.mapRestCountryToCountryArray(resp.data.objects)),
        delay(3000),
        catchError((error) => {
          console.log('Error fetching', error);

          return throwError(() => new Error('No se pudo obtener países con ese query'));
        }),
      );
  }

  searchCountryByAlphaCode(code: string) {
    const property = code.length === 2 ? 'codes.alpha_2' : 'codes.alpha_3';
    const url = `${API_URL}/${property}/${code}`;

    return this.http
      .get<RESTCountry>(url, {
        headers: {
          Authorization: `Bearer ${environment.apiKey}`,
        },
      })
      .pipe(
        map((resp) => CountryMapper.mapRestCountryToCountryArray(resp.data.objects)),
        map((countries) => countries.at(0)),
        catchError((error) => {
          console.log('Error fetching', error);

          return throwError(() => new Error('No se pudo obtener países con ese código'));
        }),
      );
  }
}
