/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.batch.scan.filesystem;

import org.junit.Test;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.batch.protocol.input.FileData;
import org.sonar.batch.protocol.input.ProjectRepositories;

import static org.assertj.core.api.Assertions.assertThat;

public class StatusDetectionTest {
  @Test
  public void detect_status() throws Exception {
    ProjectRepositories ref = new ProjectRepositories();
    ref.addFileData("foo", "src/Foo.java", new FileData("ABCDE", true));
    ref.addFileData("foo", "src/Bar.java", new FileData("FGHIJ", true));
    StatusDetection statusDetection = new StatusDetection(ref);

    assertThat(statusDetection.status("foo", "src/Foo.java", "ABCDE")).isEqualTo(InputFile.Status.SAME);
    assertThat(statusDetection.status("foo", "src/Foo.java", "XXXXX")).isEqualTo(InputFile.Status.CHANGED);
    assertThat(statusDetection.status("foo", "src/Other.java", "QWERT")).isEqualTo(InputFile.Status.ADDED);
  }
}
