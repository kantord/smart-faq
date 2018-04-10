// @flow

import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Typography } from '@kiwicom/orbit-components';

import Card from './../common/Card';
import type { FAQArticle_article } from './__generated__/FAQArticle_article.graphql';

type Props = {|
  article: FAQArticle_article,
|};

const FAQArticle = (props: Props) => (
  <Card>
    <div>
      <Typography type="attention" size="large">
        {props.article.title}
      </Typography>
    </div>
    <div>
      <Typography type="secondary" size="small">
        {props.article.perex}
      </Typography>
    </div>
  </Card>
);

export default createFragmentContainer(
  FAQArticle,
  graphql`
    fragment FAQArticle_article on FAQArticle {
      id
      title
      perex
    }
  `,
);