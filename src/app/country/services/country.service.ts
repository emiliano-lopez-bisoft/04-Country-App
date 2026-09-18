import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CountryData, RESTCountry } from '../interfaces/rest-countries.interfaces';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import type { Country } from '../interfaces/country.interface';
import { CountryMapper } from '../mappers/country.mapper';
import { Region } from '../interfaces/region.type';

const API_URL = 'https://api.restcountries.com/countries/v5';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);
  private queryCacheCapital = new Map<string, Country[]>();
  private queryCacheCountry = new Map<string, Country[]>();
  private queryCacheRegion = new Map<Region, Country[]>();

  searchByCapital(query: string): Observable<Country[]> {
    query = query.toLowerCase();

    if (this.queryCacheCapital.has(query)) {
      return of(this.queryCacheCapital.get(query) ?? []);
    }

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

    if (this.queryCacheCountry.has(query)) {
      return of(this.queryCacheCountry.get(query) ?? []);
    }

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
        tap((countries) => this.queryCacheCountry.set(query, countries)),
        delay(2000),
        catchError((error) => {
          console.log('Error fetching', error);

          return throwError(() => new Error('No se pudo obtener países con ese query'));
        }),
      );
  }

  searchByRegion(region: Region): Observable<Country[]> {
    const url = `${API_URL}/region/${region}`;

    if (this.queryCacheRegion.has(region)) {
      return of(this.queryCacheRegion.get(region) ?? []);
    }

    return this.http
      .get<RESTCountry>(url, {
        params: {
          q: region,
        },
        headers: {
          Authorization: `Bearer ${environment.apiKey}`,
        },
      })
      .pipe(
        map((resp) => CountryMapper.mapRestCountryToCountryArray(resp.data.objects)),
        tap((countries) => this.queryCacheRegion.set(region, countries)),
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
