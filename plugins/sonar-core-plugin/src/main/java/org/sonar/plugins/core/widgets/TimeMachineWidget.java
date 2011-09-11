/*
 * Sonar, open source software quality management tool.
 * Copyright (C) 2008-2011 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * Sonar is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Sonar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with Sonar; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
package org.sonar.plugins.core.widgets;

import org.sonar.api.web.AbstractRubyTemplate;
import org.sonar.api.web.RubyRailsWidget;
import org.sonar.api.web.WidgetCategory;
import org.sonar.api.web.WidgetProperties;
import org.sonar.api.web.WidgetProperty;
import org.sonar.api.web.WidgetPropertyType;

@WidgetCategory({ "History" })
@WidgetProperties(
    {
        @WidgetProperty(key = "numberOfColumns", type = WidgetPropertyType.INTEGER, defaultValue = "4"),
        @WidgetProperty(key = "displaySparkLine", type = WidgetPropertyType.BOOLEAN),
        @WidgetProperty(key = "metric1", type = WidgetPropertyType.METRIC, defaultValue = "ncloc"),
        @WidgetProperty(key = "metric2", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric3", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric4", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric5", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric6", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric7", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric8", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric9", type = WidgetPropertyType.METRIC),
        @WidgetProperty(key = "metric10", type = WidgetPropertyType.METRIC)
    }
)
public class TimeMachineWidget extends AbstractRubyTemplate implements RubyRailsWidget {
  public String getId() {
    return "time_machine";
  }

  public String getTitle() {
    return "History Table";
  }

  @Override
  protected String getTemplatePath() {
    return "/org/sonar/plugins/core/widgets/time_machine.html.erb";
  }
}