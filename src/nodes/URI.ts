import * as path from 'path';

import sdu = require('strong-data-uri');
import * as svgo from 'svgo';

import * as objects from '../objects';
import {StringableExpression, OptimizeKeywords} from '../nodes/Node';

export default class URI implements StringableExpression {
  uri: objects.String | string;

  constructor(uri: string) {
    uri = uri.trim();
    if (
      (uri[0] === uri[uri.length - 1] && (uri[0] === '"' || uri[0] === "'")) ||
      uri.indexOf(')') !== -1
    ) {
      this.uri = new objects.String(uri.substring(1, uri.length - 1));
    } else {
      this.uri = uri;
    }
  }

  asString() {
    if (this.uri instanceof objects.String) {
      return this.uri;
    }
    return new objects.String(this.uri);
  }

  asRawString() {
    if (this.uri instanceof objects.String) {
      return this.uri.value.trim();
    }
    return this.uri.trim();
  }

  toString() {
    let uri = this.uri;
    if (typeof uri === 'string' && uri.indexOf(')') !== -1) {
      uri = new objects.String(uri.trim());
    } else if (typeof uri === 'string') {
      return `url(${uri.trim().replace(/\s/g, '\\ ')})`;
    }
    const rawStr = uri.asRawString();
    return (
      'url(' +
      (!rawStr.includes(')') ? uri.asRawString() : uri.asString()) +
      ')'
    );
  }

  async pretty() {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    let self: URI | null = this;
    const isURL = this.isURL();

    // OPT: Normalize URIs
    if (kw.o1 && isURL) {
      const rawURI = this.asRawString();
      const urlCut = /https?:\/\/.+?(\/.*)/.exec(rawURI);
      if (urlCut) {
        const urlPath = urlCut[1];
        const optimizedPath = path.normalize(urlPath);
        this.uri =
          rawURI.slice(0, rawURI.length - urlCut[1].length) + optimizedPath;
      } else {
        this.uri = path.normalize(rawURI);
      }
      this.uri = this.uri.replace(/\\/g, '/');
    } else if (kw.o1 && !isURL) {
      const content = this.asRawString();
      if (content.slice(0, 5) === 'data:') {
        let out: Buffer | string | null = null;
        try {
          out = sdu.decode(content);
        } catch (e) {}
        if (!out) {
          const split = content.split(',');
          if (split.length === 1) {
            return self;
          }
          out = split[1];
        }
        try {
          self = await this.optimizeDataURI(out);
          if (!self) {
            return null;
          }
        } catch (e) {
          return self;
        }
      }
    }

    if (self.uri instanceof objects.String) {
      self.uri = self.uri.optimize(kw);
      if (!self.uri) {
        return null;
      }
    }
    return self;
  }

  async optimizeDataURI(
    data: Buffer & {mimetype?: string} | string,
  ): Promise<URI | null> {
    let newContent: string;
    if (typeof data !== 'string' && data.mimetype === 'image/svg+xml') {
      const s = new svgo({});
      try {
        newContent = (await s.optimize(data.toString('utf-8'))).data;
      } catch (e) {
        return this;
      }
    } else {
      return this;
    }

    if (!newContent) {
      return null;
    }

    return new URI(sdu.encode(newContent, data.mimetype));
  }

  isURL() {
    const content = this.asRawString();
    if (content.slice(0, 5) === 'data:') {
      return false;
    }

    if (content.slice(0, 5) === 'file:') {
      return false;
    }

    return true;
  }
}
