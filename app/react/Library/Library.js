import React from 'react';

import RouteHandler from 'app/controllers/App/RouteHandler';
import DocumentsList from 'app/Library/components/DocumentsList';
import LibraryFilters from 'app/Library/components/LibraryFilters';
import {setDocuments, setTemplates} from 'app/Library/actions/libraryActions';
import {libraryFilters, generateDocumentTypes} from 'app/Library/helpers/libraryFilters';
import documentsAPI from 'app/Library/DocumentsAPI';
import templatesAPI from 'app/Templates/TemplatesAPI';
import thesaurisAPI from 'app/Thesauris/ThesaurisAPI';
import SearchBar from 'app/Library/components/SearchBar';

export default class Library extends RouteHandler {

  static renderTools() {
    return <SearchBar/>;
  }

  static requestState() {
    return Promise.all([documentsAPI.search(), templatesAPI.get(), thesaurisAPI.get()])
    .then(([documents, templates, thesauris]) => {
      let documentTypes = generateDocumentTypes(templates);
      let properties = libraryFilters(templates, documentTypes);

      return {
        library: {
          documents: documents,
          filters: {templates: templates, documentTypes, properties, thesauris, allDocumentTypes: true}
        }
      };
    });
  }

  setReduxState({library}) {
    this.context.store.dispatch(setDocuments(library.documents));
    this.context.store.dispatch(setTemplates(library.filters.templates, library.filters.thesauris));
  }

  render() {
    return <div className="row panels-layout">
              <DocumentsList />
              <LibraryFilters />
            </div>;
  }
}

//when all components are integrated with redux we can remove this
Library.__redux = true;