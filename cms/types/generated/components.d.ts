import type { Schema, Struct } from '@strapi/strapi';

export interface SharedFigure extends Struct.ComponentSchema {
  collectionName: 'components_shared_figures';
  info: {
    description: 'An image with alt text. Alt lives here, not on the upload, so it can differ per locale.';
    displayName: 'Figure';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Stat';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_team_members';
  info: {
    displayName: 'Team member';
    icon: 'user';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTitledText extends Struct.ComponentSchema {
  collectionName: 'components_shared_titled_texts';
  info: {
    displayName: 'Titled text';
    icon: 'layer';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.figure': SharedFigure;
      'shared.stat': SharedStat;
      'shared.team-member': SharedTeamMember;
      'shared.titled-text': SharedTitledText;
    }
  }
}
